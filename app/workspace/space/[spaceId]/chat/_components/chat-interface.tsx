"use client";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  SendHorizonal,
  ArrowLeft,
  Plus,
  Users,
  X,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { io } from "socket.io-client";
import { useAuthStore } from "@/store/use-auth-store";
import {
  useCreateChat,
  useRecentChatsBySpaceId,
  useSeenMessage,
} from "@/api/chat.query";
import { useParams } from "next/navigation";
import { Chat, Message, User } from "@/types";
import { format, isToday } from "date-fns";
import { useGetSpaceById } from "@/api/space.query";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useInView } from "react-intersection-observer";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

// Form schemas
const searchFormSchema = z.object({
  query: z.string(),
});

const messageFormSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message too long"),
});

const userSearchFormSchema = z.object({
  query: z.string(),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;
type MessageFormValues = z.infer<typeof messageFormSchema>;
type UserSearchFormValues = z.infer<typeof userSearchFormSchema>;

export default function ChatInterface() {
  const queryClient = useQueryClient();
  const { spaceId } = useParams();
  const { data: chats } = useRecentChatsBySpaceId(spaceId as string);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatList, setShowChatList] = useState(true);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const { user } = useAuthStore((state) => state);

  const { mutate: mutateSeenMessage } = useSeenMessage();

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 1,
  });

  useEffect(() => {
    if (inView && selectedChat && chatMessages.length > 0) {
      const unseenMessages = chatMessages.filter(
        (msg) =>
          msg.senderId !== user?.id &&
          !msg.seenBy?.some((seenUser) => seenUser.id === user?.id)
      );

      if (unseenMessages.length > 0) {
        mutateSeenMessage({
          chatId: selectedChat.id,
          messageIds: unseenMessages.map((m) => m.id),
        });
      }
    }
  }, [inView, selectedChat, chatMessages, mutateSeenMessage, user?.id]);

  // New chat creation state
  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { data: space } = useGetSpaceById(spaceId as string);

  useEffect(() => {
    if (chats?.length && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats, selectedChat]);

  useEffect(() => {
    if (!selectedChat?.id) return;
    socket.emit("joinChat", selectedChat.id);
    return () => {
      socket.emit("leaveChat", selectedChat.id);
    };
  }, [selectedChat?.id]);

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.chatId === selectedChat?.id) {
        setChatMessages((prev) => [...prev, message]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [selectedChat?.id]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(
          `/chats/${selectedChat?.id}/messages`
        );
        setChatMessages(res.data?.data);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };

    if (selectedChat?.id) {
      fetchMessages();
    }
  }, [selectedChat]);

  // Search form
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: "",
    },
  });

  // Message form
  const messageForm = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      message: "",
    },
  });

  // User search form
  const userSearchForm = useForm<UserSearchFormValues>({
    resolver: zodResolver(userSearchFormSchema),
    defaultValues: {
      query: "",
    },
  });

  const filteredChats = searchQuery
    ? chats?.filter((chat: Chat) =>
        chat.users.some((user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : chats;

  const filteredUsers = space?.members?.filter(
    (user: User) =>
      user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) &&
      user.id !== useAuthStore.getState().user?.id
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    searchForm.setValue("query", value);
  };

  const handleUserSearchChange = (value: string) => {
    setUserSearchQuery(value);
    userSearchForm.setValue("query", value);
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatList(false);
  };

  const handleBackToChats = () => {
    setShowChatList(true);
  };

  const handleUserSelect = (user: User, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, user]);
    } else {
      setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
    }
  };

  const handleRemoveSelectedUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const { mutate: createChat } = useCreateChat();

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;

    setIsCreatingChat(true);
    try {
      createChat(
        {
          spaceId: spaceId as string,
          userIds: selectedUsers.map((u) => u.id),
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            setIsCreateChatOpen(false);
            setSelectedUsers([]);
            setUserSearchQuery("");
          },
        }
      );
    } catch (err) {
      console.error("Failed to create chat", err);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const onSendMessage = (data: MessageFormValues) => {
    console.log("Sending message:", data.message);
    const payload = {
      chatId: selectedChat?.id,
      userId: user?.id,
      content: data.message,
    };
    socket.emit("sendMessage", payload);
    messageForm.reset();
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const otherUser = selectedChat?.users.find((u) => u.id !== user?.id);
  const formatChatTimestamp = (date: Date) =>
    isToday(date) ? format(date, "p") : format(date, "MMM d, p");

  return (
    <div className='flex h-[calc(100dvh-95.5px)] overflow-hidden md:h-[calc(100dvh-106.5px)] border border-border mt-4 bg-background'>
      {/* Left Sidebar */}
      <div
        className={cn(
          " xl:flex w-full xl:w-1/3 bg-background border-r border-border flex-col",
          showChatList ? "flex" : "hidden"
        )}
      >
        {/* Header */}
        <div className='p-3 md:p-4 bg-background border-b border-border'>
          <div className='flex items-center justify-between'>
            <h1 className='text-lg md:text-xl font-semibold text-foreground'>
              Chats
            </h1>
            <Dialog open={isCreateChatOpen} onOpenChange={setIsCreateChatOpen}>
              <DialogTrigger asChild>
                <Button size='sm' className='h-8 w-8' variant='outline'>
                  <Plus className='h-4 w-4' />
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle className='flex items-center gap-2'>
                    <Users className='h-5 w-5' />
                    Create New Chat
                  </DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                  {/* Selected Users */}
                  {selectedUsers.length > 0 && (
                    <div className='space-y-2'>
                      <p className='text-sm font-medium'>Selected Users:</p>
                      <div className='flex flex-wrap gap-2'>
                        {selectedUsers.map((user) => (
                          <Badge
                            key={user.id}
                            variant='secondary'
                            className='flex items-center gap-1'
                          >
                            {user.name}
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-4 w-4 p-0 hover:bg-transparent'
                              onClick={() => handleRemoveSelectedUser(user.id)}
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Search */}
                  <Form {...userSearchForm}>
                    <form className='relative'>
                      <div className='relative'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                        <Input
                          placeholder='Search users...'
                          name='query'
                          formControl={userSearchForm.control}
                          onChange={(e) => {
                            handleUserSearchChange(e.target.value);
                          }}
                          className='pl-10'
                        />
                      </div>
                    </form>
                  </Form>

                  {/* User List */}
                  <ScrollArea className='h-64'>
                    <div className='space-y-2'>
                      {filteredUsers?.map((user) => (
                        <div
                          key={user.id}
                          className='flex items-center space-x-3 p-2 rounded-lg hover:bg-accent'
                        >
                          <Checkbox
                            id={user.id}
                            checked={selectedUsers.some(
                              (u) => u.id === user.id
                            )}
                            onCheckedChange={(checked) =>
                              handleUserSelect(user, checked as boolean)
                            }
                          />
                          <Avatar className='h-8 w-8'>
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className='bg-accent text-xs border border-border'>
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium truncate'>
                              {user.name}
                            </p>
                            <p className='text-xs text-muted-foreground truncate'>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      ))}
                      {filteredUsers?.length === 0 && (
                        <p className='text-sm text-muted-foreground text-center py-4'>
                          No users found
                        </p>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Create Button */}
                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => {
                        setIsCreateChatOpen(false);
                        setSelectedUsers([]);
                        setUserSearchQuery("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateChat}
                      disabled={selectedUsers.length === 0 || isCreatingChat}
                    >
                      {isCreatingChat
                        ? "Creating..."
                        : `Create Chat (${selectedUsers.length})`}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search Bar */}
        <div className='p-3 md:p-4 border-b border-border'>
          <Form {...searchForm}>
            <form className='relative'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  placeholder='Search chats...'
                  name='query'
                  formControl={searchForm.control}
                  onChange={(e) => {
                    handleSearchChange(e.target.value);
                  }}
                  className='pl-10'
                />
              </div>
            </form>
          </Form>
        </div>

        {/* Chat List */}
        <ScrollArea className='flex-1 h-[calc(100dvh-220px)] md:max-h-[calc(100dvh-238px)]'>
          {filteredChats?.map((chat) => {
            const otherUser = chat.users.find((u) => u.id !== user?.id);
            const unseenCount = chat.Message.filter(
              (m) =>
                m.senderId !== user?.id &&
                !m.seenBy.some((u) => u.id === user?.id)
            ).length;

            return (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`p-3 md:p-4 cursor-pointer border-b border-border ${
                  selectedChat?.id === chat.id
                    ? "bg-accent hover:bg-accent border-l-4 border-l-green-600/70"
                    : " hover:bg-accent/50"
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <Avatar className='h-10 w-10 md:h-12 md:w-12'>
                    <AvatarImage
                      src={otherUser?.avatarUrl}
                      alt={otherUser?.name}
                    />
                    <AvatarFallback className='bg-accent text-xs border border-border'>
                      {otherUser?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <div className='flex justify-between items-center'>
                      <h3 className='font-medium text-foreground truncate text-sm md:text-base'>
                        {otherUser?.name}
                      </h3>
                      <span className='text-xs text-muted-foreground font-medium'>
                        {chat.Message.length > 0 &&
                          format(
                            chat.Message[chat.Message.length - 1].createdAt,
                            "PPP"
                          )}
                      </span>
                    </div>
                    <div className='flex justify-between items-center mt-1'>
                      <p className='text-xs md:text-sm text-foreground/70 truncate'>
                        {chat.Message.length > 0 &&
                          chat.Message[chat.Message.length - 1].content}
                      </p>
                      {unseenCount > 0 && (
                        <div className='ml-2 min-w-[20px] h-5 rounded-full bg-green-500 text-white text-xs px-1 flex items-center justify-center font-medium'>
                          {unseenCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>

      {/* Right Side */}
      <div
        className={cn(
          " xl:flex flex-1 flex-col",
          showChatList ? "hidden" : "flex"
        )}
      >
        {/* Chat Header */}
        <div className='bg-background border-b border-border p-3 md:px-4 md:py-2.5 flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleBackToChats}
              className='xl:hidden'
            >
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <Avatar className='h-8 w-8 md:h-10 md:w-10'>
              <AvatarImage
                src={otherUser?.avatarUrl || "/placeholder.svg"}
                alt={otherUser?.name}
              />
              <AvatarFallback className='bg-accent text-xs border border-border'>
                {otherUser?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className='font-semibold text-foreground text-sm md:text-base'>
                {otherUser?.name}
              </h2>
            </div>
          </div>
          <div className='flex items-center space-x-1 md:space-x-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 md:h-10 md:w-10'
            >
              <Phone className='h-4 w-4 md:h-5 md:w-5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 md:h-10 md:w-10'
            >
              <Video className='h-4 w-4 md:h-5 md:w-5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 md:h-10 md:w-10'
            >
              <MoreVertical className='h-4 w-4 md:h-5 md:w-5' />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea
          className='flex-1 p-3 md:p-4 bg-background h-[calc(100dvh-220px)] md:max-h-[calc(100dvh-240px)]'
          ref={scrollRef}
        >
          <div className='space-y-3 md:space-y-4' ref={ref}>
            {chatMessages.map((message) => {
              const isSentByMe = message.senderId === user?.id;
              const isSeen = message.seenBy?.some(
                (user) => user.id === otherUser?.id
              );

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    isSentByMe ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[280px] sm:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-lg",
                      isSentByMe
                        ? "bg-accent text-foreground border border-border"
                        : "bg-green-600/70 text-white"
                    )}
                  >
                    <p className='text-sm'>{message.content}</p>
                    <div className='flex items-center justify-between mt-1'>
                      <p className='text-[11px] text-foreground/75'>
                        {formatChatTimestamp(new Date(message.createdAt))}
                      </p>
                      {isSentByMe && isSeen && (
                        <CheckCheck
                          size={12}
                          strokeWidth={3}
                          className={cn("ml-2 text-green-600/70")}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className='bg-background border-t border-border p-3 md:p-4'>
          <Form {...messageForm}>
            <form
              onSubmit={messageForm.handleSubmit(onSendMessage)}
              className='flex items-center space-x-3'
            >
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='h-8 w-8 md:h-10 md:w-10 flex-shrink-0'
              >
                <Paperclip className='h-4 w-4 md:h-5 md:w-5' />
              </Button>
              <div className='flex-1'>
                <div className='relative'>
                  <Input
                    name='message'
                    formControl={messageForm.control}
                    placeholder='Type a message...'
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        messageForm.handleSubmit(onSendMessage)();
                      }
                    }}
                    className='pr-10 text-sm md:text-base'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 md:h-8 md:w-8'
                  >
                    <Smile className='h-3 w-3 md:h-4 md:w-4' />
                  </Button>
                </div>
              </div>
              <Button
                type='submit'
                size='icon'
                disabled={!messageForm.watch("message")?.trim()}
                className='h-8 w-8 md:h-10 md:w-10 flex-shrink-0'
              >
                <SendHorizonal className='h-4 w-4 md:h-5 md:w-5' />
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

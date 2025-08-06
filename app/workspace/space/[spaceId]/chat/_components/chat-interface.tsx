"use client";
import { useState } from "react";
import {
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  SendHorizonal,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
  unread?: number;
}

interface Message {
  id: string;
  text: string;
  time: string;
  sent: boolean;
}

const chats: Chat[] = [
  {
    id: "1",
    name: "John Doe",
    lastMessage: "Hey, how are you doing?",
    time: "10:30 AM",
    avatar: "",
    unread: 2,
  },
  {
    id: "2",
    name: "Sarah Wilson",
    lastMessage: "Thanks for the help!",
    time: "9:45 AM",
    avatar: "",
  },
  {
    id: "3",
    name: "Mike Johnson",
    lastMessage: "See you tomorrow",
    time: "Yesterday",
    avatar: "",
  },
  {
    id: "4",
    name: "Emily Davis",
    lastMessage: "Perfect! Let me know",
    time: "Yesterday",
    avatar: "",
    unread: 1,
  },
  {
    id: "5",
    name: "Team Group",
    lastMessage: "Meeting at 3 PM",
    time: "Monday",
    avatar: "",
  },
];

const messages: Message[] = [
  {
    id: "1",
    text: "Hey, how are you doing?",
    time: "10:30 AM",
    sent: false,
  },
  {
    id: "2",
    text: "I'm doing great! Thanks for asking. How about you?",
    time: "10:32 AM",
    sent: true,
  },
  {
    id: "3",
    text: "Pretty good! Just working on some projects",
    time: "10:33 AM",
    sent: false,
  },
  {
    id: "4",
    text: "That sounds interesting! What kind of projects?",
    time: "10:35 AM",
    sent: true,
  },
];

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

type SearchFormValues = z.infer<typeof searchFormSchema>;
type MessageFormValues = z.infer<typeof messageFormSchema>;

export default function ChatInterface() {
  const [selectedChat, setSelectedChat] = useState<Chat>(chats[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatList, setShowChatList] = useState(true);

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

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    searchForm.setValue("query", value);
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatList(false);
  };

  const handleBackToChats = () => {
    setShowChatList(true);
  };

  const onSendMessage = (data: MessageFormValues) => {
    console.log("Sending message:", data.message);
    // Here you would typically add the message to your state/database
    messageForm.reset();
  };

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
          </div>
        </div>

        {/* Search Bar */}
        <div className='p-3 md:p-4'>
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
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatSelect(chat)}
              className={`p-3 md:p-4 cursor-pointer border-b border-border ${
                selectedChat.id === chat.id
                  ? "bg-accent hover:bg-accent border-l-4 border-l-green-600/70"
                  : " hover:bg-accent/50"
              }`}
            >
              <div className='flex items-center space-x-3'>
                <Avatar className='h-10 w-10 md:h-12 md:w-12'>
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback className='bg-accent text-xs border border-border'>
                    {chat.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <div className='flex justify-between items-center'>
                    <h3 className='font-medium text-foreground truncate text-sm md:text-base'>
                      {chat.name}
                    </h3>
                    <span className='text-xs text-muted-foreground font-medium'>
                      {chat.time}
                    </span>
                  </div>
                  <div className='flex justify-between items-center mt-1'>
                    <p className='text-xs md:text-sm text-foreground/70 truncate'>
                      {chat.lastMessage}
                    </p>
                    {chat.unread && (
                      <span className='bg-green-600/70 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center'>
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
              <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
              <AvatarFallback className='bg-accent text-xs border border-border'>
                {selectedChat.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className='font-semibold text-foreground text-sm md:text-base'>
                {selectedChat.name}
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
        <ScrollArea className='flex-1 p-3 md:p-4 bg-background h-[calc(100dvh-220px)] md:max-h-[calc(100dvh-240px)]'>
          <div className='space-y-3 md:space-y-4'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sent ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[280px] sm:max-w-xs lg:max-w-md px-3 md:px-4 py-2 rounded-lg ${
                    message.sent
                      ? "bg-green-600/70 text-white"
                      : "bg-accent text-foreground border border-border"
                  }`}
                >
                  <p className='text-sm'>{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sent ? "text-green-100" : "text-gray-500"
                    }`}
                  >
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* chat Input */}
        <div className='bg-background border-t border-border p-3 md:p-4'>
          <Form {...messageForm}>
            <form
              onSubmit={messageForm.handleSubmit(onSendMessage)}
              className='flex items-center space-x-2'
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

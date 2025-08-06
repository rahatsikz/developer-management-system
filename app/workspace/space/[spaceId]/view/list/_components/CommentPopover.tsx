import { useGetSpaceById } from "@/api/space.query";
import { useAddComment } from "@/api/task.query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Form } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";
import { Comment, Task } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PopoverClose } from "@radix-ui/react-popover";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AtSign } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function CommentPopover({ taskData }: { taskData: Task }) {
  const commnetsData: Comment[] = taskData?.Comments || [];

  const { spaceId } = useParams();

  const { data: spaceData, isLoading } = useGetSpaceById(spaceId as string);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const togglePopover = () => setPopoverOpen((prev) => !prev);

  const handlePopoverClose = (open: boolean) => {
    setPopoverOpen(open);
    if (!open && textareaRef.current) {
      textareaRef.current.focus(); // Focus the textarea when the popover closes
    }
  };

  const CommentWithHighlights = ({
    comment,
    users,
    tasks,
  }: {
    comment: string;
    users: {
      label: string;
      value: string;
    }[];
    tasks: string[];
  }) => {
    // Extract the words from the comment
    const words = comment.split(/\s+/); // Split by spaces

    return (
      <div>
        {words.map((word, index) => {
          const isUser = users.some((user: any) =>
            user.label.split(" ").some((w: string) => {
              if (word[0] === "@") {
                return w === word.slice(1);
              } else {
                return w === word;
              }
            })
          );

          const isTask = tasks.some((task: any) =>
            task.split(" ").some((w: string) => {
              if (word[0] === "@") {
                return w === word.slice(1);
              } else {
                return w === word;
              }
            })
          );

          return (
            <span
              key={index}
              className={cn(
                isUser || isTask ? "text-primary" : "text-muted-foreground",
                "text-sm font-medium"
              )}
            >
              {word[0] === "@" ? word.slice(1) : word}
              {/* Add space after the word */}
              {index < words.length - 1 && " "}
            </span>
          );
        })}
      </div>
    );
  };

  const formSchema = z.object({
    comment: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  });

  const { watch, setValue } = form;

  const commentData = watch("comment");

  const { mutate: addComment } = useAddComment(taskData.id);
  const queryClient = useQueryClient();
  const { user } = useAuthStore((state) => state);
  function onSubmit(values: z.infer<typeof formSchema>) {
    addComment(
      {
        authorId: user?.id || "",
        content: values.comment,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          form.reset({
            comment: "",
          });
        },
      }
    );
  }

  if (isLoading) return null;

  return (
    <PopoverContent
      align='end'
      className={cn(
        "xl:w-96 p-2 rounded-lg font-sans",
        commnetsData?.length ? "space-y-3" : ""
      )}
    >
      <div className='space-y-2'>
        {commnetsData?.map((item: Comment, index: number) => (
          <div
            key={index}
            className='px-2.5 py-2 border flex flex-col gap-0 rounded'
          >
            <div className='flex justify-between items-center text-sm'>
              <p className='font-semibold'>{item?.author?.name}</p>
              <p className='text-muted-foreground font-medium text-xs'>
                {format(item?.createdAt, "PPP") || "16th Feb"}
              </p>
            </div>
            <CommentWithHighlights
              comment={item.content}
              users={
                spaceData?.members.map((member: any) => ({
                  label: member.name,
                  value: member.id,
                })) || []
              }
              tasks={spaceData?.tasks.map((task: any) => task.title) || []}
            />
          </div>
        ))}
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='border border-input rounded-md divide-y'>
            <Textarea
              formControl={form.control}
              rows={3}
              name='comment'
              className={cn("resize-none border-none focus-visible:ring-0")}
              ref={textareaRef}
              onKeyDown={(e) => {
                if (e.key === "@") {
                  togglePopover();
                }
              }}
            />

            <div className='flex justify-end px-2 py-2 items-center gap-1'>
              <Popover
                modal={false}
                open={popoverOpen}
                onOpenChange={handlePopoverClose}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant='ghost'
                    className='h-7 rounded-sm'
                    onClick={togglePopover}
                  >
                    <AtSign className='size-4 text-muted-foreground' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align='end'
                  className='xl:w-96 p-2 rounded-lg font-sans'
                >
                  <Tabs defaultValue='people' className='popover-content'>
                    <TabsList className='w-full justify-start gap-3 tabs-list'>
                      <TabsTrigger value='people'>People</TabsTrigger>
                      <TabsTrigger value='task'>Tasks</TabsTrigger>
                    </TabsList>
                    <TabsContent value='people'>
                      <Command>
                        <CommandInput
                          placeholder='Type to search...'
                          className='h-8'
                        />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>

                          <CommandSeparator />
                          <CommandGroup className='mt-2'>
                            {spaceData?.members.map((item) => (
                              <PopoverClose
                                key={item.id}
                                className='flex flex-col w-full'
                              >
                                <CommandItem
                                  className='w-full'
                                  value={item.id}
                                  onSelect={() => {
                                    const updatedValue = commentData
                                      ? `${commentData} @${item.name}`
                                      : `@${item.name}`;
                                    setValue("comment", updatedValue, {
                                      shouldValidate: true,
                                    });
                                    setPopoverOpen(false);
                                  }}
                                >
                                  {item.name}
                                </CommandItem>
                              </PopoverClose>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </TabsContent>
                    <TabsContent value='task'>
                      <Command>
                        <CommandInput
                          placeholder='Type to search...'
                          className='h-8'
                        />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>

                          <CommandSeparator />
                          <CommandGroup className='mt-2'>
                            {spaceData?.tasks?.map((item) => (
                              <PopoverClose
                                key={item.id}
                                className='w-full flex flex-col'
                              >
                                <CommandItem
                                  key={item.id}
                                  value={item.id}
                                  className='w-full'
                                  onSelect={() => {
                                    const updatedValue = commentData
                                      ? `${commentData} @${item.title}`
                                      : `@${item.title}`;
                                    setValue("comment", updatedValue, {
                                      shouldValidate: true,
                                    });
                                    setPopoverOpen(false);
                                  }}
                                >
                                  {item.title}
                                </CommandItem>
                              </PopoverClose>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </TabsContent>
                  </Tabs>
                </PopoverContent>
              </Popover>
              <Button className='h-7 rounded-sm' size={"sm"} type='submit'>
                Submit
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </PopoverContent>
  );
}

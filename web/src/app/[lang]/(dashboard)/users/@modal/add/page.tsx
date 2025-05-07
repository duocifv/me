"use client"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CreateUserDto, CreateUserSchema } from "@adapter/users/dto/create-user.dto"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { useBack } from "@adapter/share/hooks/use-back"
import { useUsers } from "@adapter/users"

export default function AddUserForm() {
    const {createUser} = useUsers()
    const form = useForm<CreateUserDto>({
        resolver: zodResolver(CreateUserSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    const goBack = useBack("/users")

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(createUser.mutate)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="shadcn" {...field} />
                            </FormControl>
                            <FormDescription>This is your public display name.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input placeholder="shadcn" {...field} />
                            </FormControl>
                            <FormDescription>This is your public display name.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" distable={createUser.isLoading}>Submit</Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                >
                    Quay lại
                </Button>
            </form>
        </Form>
    )
}



import React from 'react'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import PostsTable from './features/posts/components/PostsTable'
import PostForm from './features/posts/components/PostForm'
import { createPost, updatePost } from './features/posts/api'
import { useStorePost } from './features/posts/store'

export default function CMS() {
    const posts = useStorePost(s => s.posts)
    const setPosts = useStorePost(s => s.setPosts)
    const qc = useQueryClient()
    const [editing, setEditing] = useState(null) // null for create, or post for edit
    const [formOpen, setFormOpen] = useState(false)

    const createMut = useMutation({
        mutationFn: ({ title, content, image_base64 }) => createPost({ title, content, image_base64 }),
        onMutate: async (vars) => {
            await qc.cancelQueries({ queryKey: ['posts'] })
            const prev = qc.getQueryData(['posts']) || posts
            const temp = { id: `temp-${Date.now()}`, title: vars.title, content: vars.content, created_at: new Date().toISOString() }
            const next = [temp, ...prev]
            qc.setQueryData(['posts'], next)
            setPosts(next)
            return { prev }
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) {
                qc.setQueryData(['posts'], ctx.prev)
                setPosts(ctx.prev)
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ['posts'] })
        },
    })

    const updateMut = useMutation({
        mutationFn: ({ id, title, content, image_base64 }) => updatePost({ id, title, content, image_base64 }),
        onMutate: async (vars) => {
            await qc.cancelQueries({ queryKey: ['posts'] })
            const prev = qc.getQueryData(['posts']) || posts
            const next = prev.map(p => String(p.id) === String(vars.id) ? { ...p, title: vars.title, content: vars.content } : p)
            qc.setQueryData(['posts'], next)
            setPosts(next)
            return { prev }
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) {
                qc.setQueryData(['posts'], ctx.prev)
                setPosts(ctx.prev)
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ['posts'] })
        },
    })

    function handleCreate() {
        setEditing(null)
        setFormOpen(true)
    }

    function handleEdit(post) {
        setEditing(post)
        setFormOpen(true)
    }

    function handleSubmit(payload) {
        if (editing && editing.id != null) {
            updateMut.mutate({ id: editing.id, title: payload.title, content: payload.content, image_base64: payload.image_base64 })
        } else {
            createMut.mutate({ title: payload.title, content: payload.content, image_base64: payload.image_base64 })
        }
        setFormOpen(false)
        setEditing(null)
    }

    function handleCancel() {
        setFormOpen(false)
        setEditing(null)
    }

    return (
        <div className="app">
            <header className="container">
                <h1>Posts</h1>
                <p className="subtitle">Fetched from Google Apps Script API</p>
            </header>

            <main className="container card">
                <div className="flex items-center justify-between pb-3">
                    <div />
                    <button
                        className="rounded-md bg-[color:var(--accent)] px-4 py-2 text-black font-medium hover:opacity-90"
                        onClick={handleCreate}
                    >
                        Add Post
                    </button>
                </div>

                <PostsTable onEdit={handleEdit} />

                {formOpen && (
                    <PostForm
                        initialValue={editing}
                        onCancel={handleCancel}
                        onSubmit={handleSubmit}
                    />
                )}
            </main>

            <footer className="container footer">Powered by React + Vite</footer>
        </div>
    )
}

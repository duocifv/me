import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchPosts } from "../api"
import { useStorePost } from "../store"

export default function PostsTableLoading({ children }) {
    const setPosts = useStorePost(s => s.setPosts)
    const { isLoading, isError, error, data: posts, isSuccess } = useQuery({
        queryKey: ['posts'],
        queryFn: ({ signal }) => fetchPosts({ signal }),
    })

    useEffect(() => {
        if (isSuccess && Array.isArray(posts) && posts.length > 0) {
            setPosts(posts)
        }
    }, [isSuccess, posts, setPosts])

    if (isLoading) {
        return (
            <tr>
                <td colSpan={5} className="status py-4">Loading...</td>
            </tr>
        )
    }
    if (isError) {
        return (
            <tr>
                <td colSpan={5} className="status error py-4">{error?.message || 'Failed to fetch data'}</td>
            </tr>
        )
    }
    if (isSuccess && posts.length === 0) {
        return (
            <tr>
                <td colSpan={5} className="status py-4">No data found</td>
            </tr>
        )
    }



    return <>{children}</>
}

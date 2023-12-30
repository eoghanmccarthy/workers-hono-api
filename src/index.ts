import { Bindings, Param } from './types'

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { basicAuth } from 'hono/basic-auth'
import { prettyJSON } from 'hono/pretty-json'

import { getPosts, getPost, createPost } from './model'

const app = new Hono()
app.get('/', (c) => c.text('My Cloudfare Workers API'))
app.use('*', prettyJSON())
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

const api = new Hono<{ Bindings: Bindings }>()

api.use('/posts/*', cors({
    origin: 'http://localhost:3000'
}))

api.get('/posts', async (c) => {
    const posts = await getPosts()
    return c.json({ ok: true, posts })
})

api.get('/posts/:id', async (c) => {
    const {id} = c.req.param()
    const post = await getPost(id)
    if (!post) {
        return c.json({ error: 'Not Found', ok: false }, 404)
    }
    return c.json({ ok: true, post })
})

api.post('/posts', async (c) => {
    const param = await c.req.parseBody() as Param;
    const newPost = await createPost(param as Param)
    if (!newPost) {
        return c.json({ error: 'Can not create new post', ok: false }, 422)
    }
    return c.json({ ok: true, post: newPost }, 201)
})

app.route('/api', api)

export default app

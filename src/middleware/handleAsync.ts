import { RequestHandler } from 'express'
import core from 'express-serve-static-core'

type HandleAsyncCallback<P, ResBody, ReqBody, ReqQuery, Locals> = (
    ...args: Parameters<RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>>
) => void | Promise<void>

type HandleAsync = <
    P = core.ParamsDictionary,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = core.Query,
    Locals extends Record<string, unknown> = Record<string, unknown>
>(
    callback: HandleAsyncCallback<P, ResBody, ReqBody, ReqQuery, Locals>
) => RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>

const handleAsync: HandleAsync = (callback) => async (req, res, next) => {
    try {
        await callback(req, res, next)
    } catch (e) {
        next(e)
    }
}

export default handleAsync

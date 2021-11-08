import { Request, Response } from 'express'

export default function catchAllRoute(req: Request, res: Response) {
    return res.status(404).json({ message: 'not found' })
}

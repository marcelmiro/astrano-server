import { Request, Response } from 'express'

export default function catchAllRoute(_req: Request, res: Response) {
    return res.status(404).json({ message: 'Not found' })
}

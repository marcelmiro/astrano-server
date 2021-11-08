import { CorsOptions } from 'cors'

import { originUrl } from './index.config'

const corsOptions: CorsOptions = {
    origin: originUrl,
    credentials: true
}

export default corsOptions

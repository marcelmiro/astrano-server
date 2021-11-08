import { createAvatar, Options } from '@dicebear/avatars'
import * as style from '@dicebear/avatars-identicon-sprites'

type AvatarOptions = Partial<style.Options & Options>

const baseAvatarOptions: AvatarOptions = {
    size: 32,
    base64: true,
    backgroundColor: 'white',
}

export function generateAvatar(seed: string, options?: AvatarOptions) {
    const avatarOptions = { ...baseAvatarOptions, ...options, seed }
    const avatar = createAvatar(style, avatarOptions)
    return avatar
}

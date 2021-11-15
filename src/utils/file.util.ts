import { createAvatar, Options as _AvatarOptions } from '@dicebear/avatars'
import * as identiconStyle from '@dicebear/avatars-identicon-sprites'

type AvatarOptions = Partial<identiconStyle.Options & _AvatarOptions>

const baseAvatarOptions: AvatarOptions = {
	size: 32,
	base64: true,
	backgroundColor: 'white',
}

export function generateAvatar(seed: string, options?: AvatarOptions) {
	const avatarOptions = { ...baseAvatarOptions, ...options, seed }
	const avatar = createAvatar(identiconStyle, avatarOptions)
	return avatar
}

// TODO: Upload file and return file URL
/* export function uploadFile(file: File): string {
	return ''
}

// TODO: Delete file
export function deleteFile(fileKey: string) {} */

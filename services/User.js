// const baseUrl = 'http://192.168.100.100:3333/'
const baseUrl = 'https://vps49327.publiccloud.com.br/api/'
const headers = () => {
	if (!app.user)
		return
	return {
		user_id: app.user._id
	}
}

const User = {
	//Session
	login: (body) => {
		return zPost(`${ baseUrl }session/login`, body)
	},
	signup: (body) => {
		return zPost(`${ baseUrl }session/signup`, body)
	},

	//Folders
	createFolder: (body) => {
		return zPost(`${ baseUrl }webDesktop/folder/create`, body, headers())
	},
	listDirectory: (directory) => {
		return zGet(`${ baseUrl }webDesktop/folder/listFrom/${ directory }`, headers())
	},
	editFolder: (folder) => {
		return zPut(`${ baseUrl }webDesktop/folder/update/${ folder._id }`, folder, headers())
	},
	deleteFolder: (folder) => {
		return zDelete(`${ baseUrl }webDesktop/folder/delete/${ folder._id }`, headers())
	},

	//Links
	createLink: (body) => {
		return zPost(`${ baseUrl }webDesktop/link/create`, body, headers())
	},
	editLink: (link) => {
		return zPut(`${ baseUrl }webDesktop/link/update/${ link._id }`, link, headers())
	},
	deleteLink: (link) => {
		return zDelete(`${ baseUrl }webDesktop/link/delete/${ link._id }`, headers())
	}
}

export default User
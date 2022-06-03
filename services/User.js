// const baseUrl = 'https://razion-apis.herokuapp.com/'
const baseUrl = 'http://192.168.100.100:3333/'
const headers = () => {
	if (!app.user)
		return
	return {
		user_id: app.user._id
	}
}

const User = {

	//Folders
	createFolder: (body) => {
		console.log(app)
		return zPost(`${ baseUrl }webDesktop/folder/create`, body, headers())
	},
	getFolders: (parentFolder) => {
		return zGet(`${ baseUrl }webDesktop/folder/listFrom/${ parentFolder }`, headers())
	},
	editFolder: (folder) => {
		return zPut(`${ baseUrl }webDesktop/folder/update/${ folder._id }`, folder, headers())
	}
}

export default User
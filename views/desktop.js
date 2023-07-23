const style = document.createElement('style')
style.textContent = /*css*/`
	#desktop {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}

	#googleSearchInput{
		width: 75%;
		max-width: 600px;
		position: absolute;
		top: 17px;
		left: 50%;
		transform: translate(-50%,0);
		padding: 3px;
	}

	#pexelsLinks {
		position: fixed;
		bottom: 7px;
		right: 7px;
		background: var(--transparentBg);
		padding: 3px;
		border-radius: .3rem;
	}

	#pexelsLinks:hover {
		background: var(--dark-bg2);
	}

	a {
		text-decoration: none;
		font-weight: bold;
	}

	.widget {
		z-index: 1;
	}

	.onFocus {
		z-index: 3;
	}

`
const template = document.createElement('template')
template.innerHTML = /*html*/`
	<div id="desktop" z-onclick="rmFolderFocus">
		
		<z-input type="search" id="googleSearchInput" class="dark-bg2" placeholder="Pesquisa Google" z-model="googleSearch" z-onkeydown="submitGoogleSearch"></z-input>
	
		<fragment z-for="folder in folders">
			<app-folder z-if="folder.parentFolder" _id="{{folder._id}}" parentFolder="desktop" name="{{folder.name}}" left="{{folder.left}}" top="{{folder.top}}"></app-folder>
		</fragment>

		<fragment z-for="link in links">
			<app-link z-if="link.parentFolder" _id="{{link._id}}" parentFolder="desktop" name="{{link.name}}" url="{{link.url}}" left="{{link.left}}" top="{{link.top}}"></app-link>
		</fragment>

		<p id="pexelsLinks"><a id="photoLink" target="_blank">Foto</a> de <a id="photographerLink" target="_blank"><span id="photographerName"></span></a> no <a href="https://pexels.com" target="_blank">Pexels</a>.</p>
	</div>
`

import User from '../services/User.js'
import Folder from '../components/folder.js'
import Link from '../components/link.js'
import Explorer from '../components/explorer.js'
export default class Desktop extends HTMLElement {
	constructor() {
		super()

		if (!app.user) {
			if (localStorage.getItem('Razion.user'))
				app.user = JSON.parse(localStorage.getItem('Razion.user'))
			else {
				app.style.background = 'var(--dark-bg2)'
				location.hash = '#/'
			}
		}

		if (app.user) {
			this.attachShadow({ mode: 'open' })
			this.shadowRoot.appendChild(style.cloneNode(true))
			this.shadowRoot.appendChild(template.content.cloneNode(true))

			this.desktop = this.shadowRoot.querySelector('#desktop')

			this.backgroundImages = []
			this.recentSearches = JSON.parse(localStorage.getItem('webDesktop.recentSearches')) || []
			this.searchList = ['Nature', 'City', 'Rain', 'Sunset', 'Ocean', 'Islands', 'Thunderstorm', 'Snow', 'Hills', 'River', 'Waterfall', 'Stars', 'Moon', 'Sky']
			// this.searchList = ['Thunderstorm']
			this.search = this.searchList[Math.floor(Math.random() * this.searchList.length)]
			this.googleSearch = ''
			this.inLandscape = window.innerWidth > window.innerHeight
			this.imageInUse = null
			this.folders = [{}]
			this.links = [{}]
			User.listDirectory('desktop')
				.then((res) => {
					this.folders = res.folders
					this.links = res.links
				})
			this.draggingComponent = null
			this.clickDiff = { x: 0, y: 0 }

			this.getImagesFromPexels = () => {
				this.backgroundImages = []
				zGet(`https://api.pexels.com/v1/search?query=${ this.search }&per_page=80&size=medium&orientation=${ this.inLandscape ? 'landscape' : 'portrait' }`, {
					Authorization: "563492ad6f91700001000001aad794b0b91340189909ea050f967cab"
				})
					.then(async (res) => {
						if (res.photos) {
							for (let i = 0; i < 5; i++) {
								let photo = res.photos[Math.floor(Math.random() * res.photos.length)]
								while (this.backgroundImages.find(image => image.id == photo.id)) {
									photo = res.photos[Math.floor(Math.random() * res.photos.length)]
								}
								this.backgroundImages.push(photo)
							}
							// this.backgroundImages = res.photos
							this.setBackgroundImage()
						}
					})
			}

			this.setBackgroundImage = () => {
				let random = Math.floor(Math.random() * this.backgroundImages.length)
				this.imageInUse = this.backgroundImages[random]
				this.shadowRoot.getElementById('photoLink').href = this.imageInUse.url
				this.shadowRoot.getElementById('photographerLink').href = this.imageInUse.photographer_url
				this.shadowRoot.getElementById('photographerName').innerText = this.imageInUse.photographer
				app.style.background = `url(${ this.inLandscape ? this.imageInUse.src.landscape : this.imageInUse.src.portrait })`
				app.style.backgroundRepeat = 'no-repeat'
				app.style.backgroundColor = "var(--dark-bg2)"
				app.style.backgroundSize = "cover"
				app.style.backgroundPosition = 'center'
				app.style.backgroundAttachment = 'fixed'
				this.backgroundImages.splice(random, 1)
				if (this.backgroundImages.length > 0)
					localStorage.setItem('webDesktop.backgroundImages', JSON.stringify(this.backgroundImages))
				else
					localStorage.removeItem('webDesktop.backgroundImages')
			}

			this.submitGoogleSearch = (e) => {
				if (e.key == 'Enter' && this.googleSearch.trim()) {
					window.open(`http://google.com/search?q=${ this.googleSearch }`)
				}
			}

			document.addEventListener('deleteFolder', (e) => {
				this.folders = this.folders.filter(f => f._id != e.detail._id)
			})

			document.addEventListener('deleteLink', (e) => {
				this.links = this.links.filter(l => l._id != e.detail._id)
			})

			this.rmFolderFocus = (e) => {
				let mx = e.touches ? e.touches[e.touches.length - 1].clientX : e.clientX
				let my = e.touches ? e.touches[e.touches.length - 1].clientY : e.clientY
				if (this.shadowRoot.elementFromPoint(mx, my).id == 'desktop') {
					Array.from(this.desktop.querySelectorAll('app-folder')).map((folder) => {
						folder.focused = false
					})
				}
			}

			this.showContextMenu = (e) => {
				this.rmFolderFocus(e)
				let left = e.touches ? e.touches[e.touches.length - 1].clientX : e.clientX
				let top = e.touches ? e.touches[e.touches.length - 1].clientY : e.clientY
				let clickedElement = this.shadowRoot.elementFromPoint(e.clientX, e.clientY)

				if (clickedElement.id == 'desktop') {
					let items = [
						{
							text: 'Explorar',
							action: () => this.newExplorer('desktop')
						},
						{
							text: 'Nova Pasta',
							action: this.createFolder
						},
						{
							text: 'Novo Link',
							action: this.createLink
						}
					]
					contextMenu.show(items, left, top)
					document.body.addEventListener('click', contextMenu.close)
				}
				e.preventDefault()
			}
			this.oncontextmenu = this.showContextMenu

			this.createFolder = (left, top) => {
				User.createFolder({
					name: 'Nova Pasta',
					left: left,
					top: top
				})
					.then((res) => {
						this.folders = [...this.folders, res]
					})
			}

			this.createLink = (left, top) => {
				zDialog.prompt('Adicionar link', [
					{
						prompt: 'Nome',
						value: ''
					},
					{
						prompt: 'URL',
						value: ''
					}
				])
					.then((res) => {
						let link = res
						if (link) {
							if (!link['URL'].startsWith('http'))
								link['URL'] = 'http://' + link['URL']
							User.createLink({
								name: link['Nome'],
								url: link['URL'],
								left,
								top
							})
								.then((res) => {
									this.links = [...this.links, res]
								})
						}
					})
			}

			this.newExplorer = (directory) => {
				this.desktop.appendChild(new Explorer(directory, this.desktop))
			}

			window.addEventListener('resize', () => {
				let oldValue = this.inLandscape
				if (this.inLandscape && window.innerWidth < window.innerHeight)
					this.inLandscape = false
				else if (!this.inLandscape && window.innerWidth > window.innerHeight)
					this.inLandscape = true

				if (oldValue != this.inLandscape) {
					document.body.style.background = `url(${ this.inLandscape ? this.imageInUse.src.landscape : this.imageInUse.src.portrait })`
					document.body.style.backgroundRepeat = 'no-repeat'
					document.body.style.backgroundColor = "var(--dark-bg2)"
					document.body.style.backgroundSize = "cover"
					document.body.style.backgroundPosition = 'center'
					document.body.style.backgroundAttachment = 'fixed'
				}
			})

			if (localStorage.getItem('webDesktop.backgroundImages')) {
				try {
					let photos = JSON.parse(localStorage.getItem('webDesktop.backgroundImages'))
					photos.map((photo) => {
						this.backgroundImages.push(photo)
					})
					this.setBackgroundImage()
				}
				catch {
					localStorage.removeItem('webDesktop.backgroundImages')
					this.getImagesFromPexels()
				}
			}
			else {
				while (this.recentSearches.find(s => s == this.search))
					this.search = this.searchList[Math.floor(Math.random() * this.searchList.length)]
				this.recentSearches.push(this.search)
				if (this.recentSearches.length == this.searchList.length) {
					this.recentSearches = []
					localStorage.removeItem('webDesktop.recentSearches')
				}
				else
					localStorage.setItem('webDesktop.recentSearches', JSON.stringify(this.recentSearches))

				this.getImagesFromPexels()
			}
		}
	}
}

customElements.define('view-desktop', Desktop)
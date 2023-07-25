const style = document.createElement('style')
style.textContent = /*css*/`
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		border: none;
		outline: none;
		-webkit-tap-highlight-color: transparent;
		font-family: 'Ubuntu', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		user-select: none;
	}

	#folderDiv {
		position: relative;
		width: 75px;
		height: fit-content;
		text-align: center;
		border: 1px solid transparent;
		border-radius: .2rem;
	}

	#folderDiv:hover,
	#folderDiv:focus {
		background: var(--transparentBg);
		border: 1px solid var(--dark-bg4);
	}

	#folderDiv img {
		width: 75%;
		-webkit-user-drag: none;
		user-select: none;
		filter: drop-shadow(0 0 1px var(--light-bg4));
	}

	#folderDiv textarea {
		width: 100%;
		height: 28px;
		background: transparent;
		resize: none;
		padding: 0;
		text-align: center;
		cursor: default;
		user-select: none;
		pointer-events: none;
		color: var(--light-font2);
		font-size: .8em;
		overflow: hidden;
		text-shadow: 0 -1px 1px #000,
			1px -1px 1px #000,
			1px 0 1px #000,
			1px 1px 1px #000,
			0 1px 1px #000,
			-1px 1px 1px #000,
			-1px 0 1px #000,
			-1px -1px 1px #000;
	}

	.hovered {
		background: var(--dark-bg0)!important;
	}

	@keyframes close {
		to {
			transform: scale(0);
			opacity: 0;
		}
	}
`
const template = document.createElement('template')
template.innerHTML = /*html*/`
	<div id="folderDiv" tabindex="0" z-onmousedown="setMouseDown" z-ontouchstart="setMouseDown" z-onmouseup="handleClick">
		<img src="assets/folder1.svg">
		<textarea z-model="name" tabindex=-1></textarea>
	</div>
`

import User from '../services/User.js'
import Explorer from '../components/explorer.js'
export default class Folder extends HTMLElement {
	constructor(_id, parentFolder, name, left, top) {
		super()
		this.attachShadow({ mode: 'open' })
		this.shadowRoot.appendChild(style.cloneNode(true))
		this.shadowRoot.appendChild(template.content.cloneNode(true))

		this.rootNode = this.getRootNode()
		this.host = this.rootNode.host

		if (this.host.tagName == 'VIEW-DESKTOP')
			this.shadowRoot.host.style.position = 'absolute'

		this._id = _id || this.getAttribute('_id')
		this.parentFolder = parentFolder || this.getAttribute('parentFolder')
		this.name = name || this.getAttribute('name')
		this.left = left || this.getAttribute('left')
		this.top = top || this.getAttribute('top')
		this.clickDiff = { x: 0, y: 0 }
		this.mouseDown = null
		this.dragging = false
		this.focused = false
		this.hoveringElement = null
		this.textarea = this.shadowRoot.querySelector('textarea')

		this.watch = {
			top: () => {
				this.style.top = this.top + 'px'
			},
			left: () => {
				this.style.left = this.left + 'px'
			},
			'focused': () => {
				if (this.focused) {
					this.shadowRoot.host.style.zIndex = '3'
					this.textarea.style.height = this.textarea.scrollHeight + 'px'
				}
				else {
					this.shadowRoot.host.style.zIndex = ''
					this.textarea.style.height = ''
				}
			}
		}

		let dblclickTimer
		this.handleClick = () => {
			// Double Click
			if (dblclickTimer) {
				clearTimeout(dblclickTimer)
				dblclickTimer = null

				if (this.host.tagName == 'VIEW-DESKTOP') {
					this.rootNode.querySelector('#desktop').appendChild(new Explorer(this._id, this.rootNode.querySelector('#desktop')))
				}
				else
					this.host.changeDirectory(this._id)
				this.focused = false
			}
			// One Click
			else {
				dblclickTimer = setTimeout(() => {
					dblclickTimer = null
				}, 350)
			}
		}

		this.setMouseDown = (e) => {
			if ((e.which == 1 || e.touches)) {
				let mx = e.touches ? e.touches[e.touches.length - 1].clientX : e.clientX
				let my = e.touches ? e.touches[e.touches.length - 1].clientY : e.clientY

				this.mouseDown = {
					x: mx,
					y: my
				}

				Array.from(this.rootNode.querySelectorAll('app-folder')).map((folder) => {
					folder.focused = false
				})
				Array.from(this.rootNode.querySelectorAll('app-link')).map((link) => {
					link.focused = false
				})
				this.focused = true

				let boundings = this.getBoundingClientRect()
				this.clickDiff = {
					x: mx - boundings.left,
					y: my - boundings.top
				}

				app.addEventListener('mousemove', this.drag)
				app.addEventListener('touchmove', this.drag)
				app.addEventListener('mouseup', this.drop)
				app.addEventListener('touchend', this.drop)
			}
		}

		this.drag = (e) => {
			let mx = e.touches ? e.touches[e.touches.length - 1].clientX : e.clientX
			let my = e.touches ? e.touches[e.touches.length - 1].clientY : e.clientY
			if (this.dragging) {

				this.style.left = mx - this.clickDiff.x + 'px'
				this.style.top = my - this.clickDiff.y + 'px'

				this.checkCollisions()
				this.hoveringElement = this.rootNode.elementsFromPoint(mx, my).filter(e => e !== this.shadowRoot.host)[0]

				if (this.hoveringElement.tagName == 'APP-FOLDER')
					this.hoveringElement.shadowRoot.querySelector('#folderDiv').classList.add('hovered')
				else
					this.clearHovereds()
				e.preventDefault()
			}
			else {
				if (this.mouseDown) {
					let difX = mx - this.mouseDown.x
					if (difX < 0) difX *= -1
					let difY = my - this.mouseDown.y
					if (difY < 0) difY *= -1

					if (difX > 20 || difY > 20) {
						this.dragging = true
						if (this.host.tagName != 'VIEW-DESKTOP') {
							this.shadowRoot.host.style.position = 'absolute'
						}
						this.style.left = mx - this.clickDiff.x + 'px'
						this.style.top = my - this.clickDiff.y + 'px'

						app.appendChild(this)
					}
				}
			}
		}

		this.drop = (e) => {
			this.mouseDown = null
			if (this.dragging) {
				if (this.hoveringElement) {
					if (this.hoveringElement.id == 'desktop') {
						this.parentFolder = 'desktop'
						this.left = this.style.left.replace('px', '')
						this.top = this.style.top.replace('px', '')
					}
					else if (this.hoveringElement.id == 'section' && this.hoveringElement.getRootNode().host.directory != this._id)
						this.parentFolder = this.hoveringElement.getRootNode().host.directory
					else if (this.hoveringElement.tagName == 'APP-FOLDER' && this.hoveringElement._id != this._id) {
						this.parentFolder = this.hoveringElement._id
					}
					else
						this.hoveringElement = null
				}
				loadingLock = true
				User.editFolder({
					_id: this._id,
					name: this.name,
					left: this.left,
					top: this.top,
					parentFolder: this.parentFolder
				})
					.finally(() => {
						document.dispatchEvent(new CustomEvent('updateFolder', { detail: this }))
						loadingLock = false
					})

				this.dragging = false
				this.clickDiff = null
				this.focused = false

				if (this.hoveringElement) {
					if (this.hoveringElement.id == 'desktop')
						this.hoveringElement.insertBefore(this, this.hoveringElement.querySelector("[z-for='folder in folders'][end-z-for]"))
					if (this.hoveringElement.id == 'section') {
						this.shadowRoot.host.style.position = 'relative'
						this.style.left = 'unset'
						this.style.top = 'unset'
						this.hoveringElement.insertBefore(this, this.hoveringElement.querySelector('[end-z-for]'))
					}
					else if (this.hoveringElement._id && this.hoveringElement._id != this._id)
						this.selfRemove()
				}
				this.clearHovereds()
			}

			app.removeEventListener('mousemove', this.drag)
			app.removeEventListener('touchmove', this.drag)
			app.removeEventListener('mouseup', this.drop)
			app.removeEventListener('touchend', this.drop)
		}

		this.clearHovereds = () => {
			Array.from(this.rootNode.querySelectorAll('APP-FOLDER')).map((folder) => {
				folder.shadowRoot.querySelector('#folderDiv').classList.remove('hovered')
			})
			Array.from(this.rootNode.querySelectorAll('APP-LINK')).map((link) => {
				link.shadowRoot.querySelector('#linkDiv').classList.remove('hovered')
			})
		}

		this.checkCollisions = () => {
			let boundings = this.getBoundingClientRect()
			if (boundings.left < 0)
				this.left = 0
			if (boundings.top < 0)
				this.top = 0
			if (boundings.left + boundings.width > window.innerWidth)
				this.left = window.innerWidth - boundings.width
			if (boundings.top + boundings.height > window.innerHeight)
				this.top = window.innerHeight - boundings.height
		}

		this.selfRemove = () => {
			const rmSelf = () => {
				this.shadowRoot.host.removeEventListener('animationend', rmSelf)
				this.shadowRoot.host.parentElement.removeChild(this)
				document.dispatchEvent(new CustomEvent('deleteFolder', { detail: this }))
			}
			this.shadowRoot.host.style.animation = 'close .4s ease-in-out'
			this.shadowRoot.host.addEventListener('animationend', rmSelf)
		}

		this.showContextMenu = (e) => {
			this.focused = true
			let left = e.touches ? e.touches[e.touches.length - 1].clientX : e.clientX
			let top = e.touches ? e.touches[e.touches.length - 1].clientY : e.clientY
			let items = [
				{
					text: 'Renomear',
					action: this.rename
				},
				{
					text: 'Excluir',
					action: this.delete
				}
			]
			contextMenu.show(items, left, top)
			document.body.addEventListener('click', contextMenu.close)
		}
		this.oncontextmenu = this.showContextMenu

		this.rename = () => {
			let oldValue = this.textarea.value
			this.textarea.style.pointerEvents = 'auto'
			this.textarea.style.cursor = 'text'
			this.textarea.select()

			const rn = () => {
				this.textarea.style.pointerEvents = ''
				this.textarea.style.cursor = ''
				if (this.textarea.value.trim() != '' && this.textarea.value != oldValue) {
					User.editFolder({
						_id: this._id,
						name: this.textarea.value,
						left: this.left,
						top: this.top,
						parentFolder: this.parentFolder
					})
						.then(() => {
							document.dispatchEvent(new CustomEvent('updateFolder', { detail: this }))
						})
				}
				else {
					this.textarea.value = oldValue
				}
			}

			this.textarea.onblur = () => {
				rn()
			}

			this.textarea.onkeydown = (e) => {
				if (e.key == 'Escape') {
					this.textarea.value = oldValue
					this.textarea.blur()
				}
				if (e.key == 'Enter' && !e.shiftKey)
					this.textarea.blur()
			}
		}

		this.delete = async () => {
			if (await zDialog.confirm('Por favor, confirme:', `<p style="margin-bottom:7px">Deseja mesmo excluir a pasta <b>${ this.name }</b> e todo seu conteúdo ?</p>
					<p style="color:var(--danger-light)">Esta ação não poderá ser defeita.</p>`)) {
				User.deleteFolder(this)
					.then((res) => {
						this.selfRemove()
					})
			}
		}

		if (this.host.tagName == 'VIEW-DESKTOP') {
			this.style.left = this.left + 'px'
			this.style.top = this.top + 'px'
		}

		window.addEventListener('resize', this.checkCollisions)

		ZION(this)
		this.checkCollisions()
	}
}

customElements.define('app-folder', Folder)
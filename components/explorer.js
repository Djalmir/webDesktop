const style = document.createElement('style')
style.textContent = /*css*/`
	#screen {
		position: absolute;
		top: 15%;
		left: 12.5%;
		width: 75%;
		height: 60%;
		min-width: 280px;
		min-height: 160px;
		background: var(--darkgray3);
		border-radius: .3rem;
		box-shadow: 0 0 1px var(--white);
		overflow: hidden;
		resize: both;
		z-index: 2;
		transform-style: preserve-3d;
	}

	.onFocus {
		z-index: 3!important;
	}

	header {
		background: var(--darkgray4);
		padding: 3px 7px;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		user-select: none;
	}

	header b {
		text-transform: capitalize;
		pointer-events: none;
		user-select: none;
		overflow: hidden;
	}

	#headerBtnsDiv {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
	}

	#headerBtnsDiv button {
		margin: 0;
		padding: 5px;
		width: 23px;
		height: 17px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#explorer {
		width: 100%;
		height: 100%;
		display: flex;
	}

	aside {
		position: relative;
		min-width: 120px;
		width: fit-content;
		max-width: 300px;
		height: 100%;
		padding: 7px 0 77px;
		white-space: nowrap;
		user-select: none;
		overflow-y: auto;
		overflow-x: hidden;
	}

	aside::-webkit-scrollbar{
		width: 0;
	}

	aside details {
		position: relative;
		cursor: default;
		padding-left: 17px;
		margin: 3px 0;
	}

	aside details.active summary {
		/* */
	}

	aside details summary {
		padding: 7px 13px;
		transition: .1s;
		border-radius: .4rem 0 0 .4rem;
	}

	aside details summary:hover,
	aside details summary:focus {
		background: var(--darkgray2);
	}
	
	
	aside details summary.active {
		color: var(--blue);
		background: var(--darkgray2);
	}
	
	aside details summary::marker {
		color: var(--gray2);
	}

	aside details summary.active::marker {
		color: var(--darkblue2);
	}

	aside #asideResizer {
		position: absolute;
		top: 0;
		right: 0;
		width: 7px;
		height: 100%;
		background: var(--darkgray2);
	}

	section {
		flex: 1;
		background: var(--darkgray2);
		overflow-y: auto;
		padding: 13px;
		display: grid;
		grid-template-columns: repeat(auto-fit,75px);
		grid-template-rows: repeat(auto-fit, 100px);
		gap: 7px;
	}

	@keyframes open {
		from {
			opacity: 0;
			transform-origin: top center;
			transform: perspective(50vw) rotateX(-90deg) translateZ(-250px);
		}
	}

	@keyframes close {
		to {
			opacity: 0;
			transform-origin: bottom center;
			transform: perspective(50vw) rotateX(90deg) translateZ(-250px);
		}
	}
`
const template = document.createElement('template')
template.innerHTML = /*html*/`
	<div id="screen" class="draggable widget">
		<header id="header" z-onmousedown="setMouseDown" z-ontouchstart="setMouseDown" z-onmouseup="handleClick('header')">
			<b z-model="name"></b>
			<div id="headerBtnsDiv">
				<button>
					<img src="./assets/minimize.svg">
				</button>
				<button z-onclick="maximize">
					<img src="./assets/restore.svg" z-if="maximized">
					<img src="./assets/maximize.svg" z-else>
				</button>
				<button class="redBt" z-onclick="close">
					<img src="./assets/close.svg">
				</button>
			</div>
		</header>
		<div id="explorer"><!--z-onclick="resetFolderHeight"-->
			<aside id="aside">
				<details id="details_desktop" open="true">
					<summary z-onclick="changeDirectory('desktop')">Desktop</summary>
					<fragment z-for="folder in desktopFolders">
						<details id="details_{{folder._id}}" z-if="folder._id">
							<summary z-onclick="changeDirectory({{folder._id}})">{{folder.name}}</summary>
						</details>
					</fragment>
				</details>
				<div id="asideResizer"></div>
			</aside>
			<section id="section">
				<fragment z-for="folder in folders">
					<app-folder z-if="folder.parentFolder" _id="{{folder._id}}" parentFolder="{{folder.parentFolder}}" name="{{folder.name}}" left="{{folder.left}}" top="{{folder.top}}"></app-folder>
				</fragment>
			</section>
		</div>
	</div>
`

import User from '../services/User.js'
export default class Explorer extends HTMLElement {
	constructor(directory, desktop) {
		super()
		this.attachShadow({mode: 'open'})
		fetch('./app.css')
			.then((res) => {return res.text()})
			.then((res) => {
				style.textContent = res + style.textContent

				this.shadowRoot.appendChild(style.cloneNode(true))
				this.shadowRoot.appendChild(template.content.cloneNode(true))

				this.desktop = desktop
				this.maximized = false
				this.screen = this.shadowRoot.querySelector('#screen')
				this.header = this.shadowRoot.querySelector('#header')
				this.aside = this.shadowRoot.querySelector('#aside')
				this.asideResizer = this.shadowRoot.querySelector('#asideResizer')
				this.section = this.shadowRoot.querySelector('section')
				this.foldersWrapper = this.shadowRoot.querySelector('#foldersWrapper')

				this.screen.style.animation = 'open .4s ease-out'

				this.directory = null

				this.name = ''
				this.desktopFolders = [{}]
				this.folders = [{}]

				this.clickDiff = {x: 0, y: 0}
				this.mouseDown = null
				this.dragging = false

				loadingLock = true
				User.getFolders('desktop')
					.then((res) => {
						this.desktopFolders = res.folders.length ? res.folders : [{}]
						loadingLock = false
					})

				let oldId = null
				let dblclickTimer = null
				this.handleClick = (id) => {
					// double click
					if (dblclickTimer) {
						if (id == 'header' && oldId == id)
							this.maximize()
					}

					oldId = id
					if (dblclickTimer)
						clearTimeout(dblclickTimer)
					dblclickTimer = setTimeout(() => {
						dblclickTimer = null
					}, 350)
				}

				this.setMouseDown = (e) => {
					if ((e.which == 1 || e.touches)) {
						let mx = e.touches ? e.touches[e.touches.length - 1].clientX : e.clientX
						let my = e.touches ? e.touches[e.touches.length - 1].clientY : e.clientY

						this.mouseDown = {
							x: mx,
							y: my
						}

						let boundings = this.screen.getBoundingClientRect()
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
						this.screen.style.left = mx - this.clickDiff.x + 'px'
						this.screen.style.top = my - this.clickDiff.y + 'px'
					}
					else {
						if (this.mouseDown) {
							let difX = mx - this.mouseDown.x
							if (difX < 0) difX *= -1
							let difY = my - this.mouseDown.y
							if (difY < 0) difY *= -1

							if (difX > 5 || difY > 5)
								this.dragging = true
						}
					}
					e.preventDefault()
				}

				this.drop = (e) => {
					this.mouseDown = null
					if (this.dragging) {
						this.dragging = false
						this.clickDiff = null
					}
					app.removeEventListener('mousemove', this.drag)
					app.removeEventListener('touchmove', this.drag)
					app.removeEventListener('mouseup', this.drop)
					app.removeEventListener('touchend', this.drop)
				}

				this.changeDirectory = (directory) => {
					let dir = directory.replace('folder_', '')
					if (dir != this.directory) {
						loadingLock = true
						User.getFolders(dir)
							.then((res) => {
								this.directory = dir
								this.name = res.folder.name
								this.folders = res.folders.length ? res.folders : [{}]

								if (dir != 'desktop') {
									let asideMenu = this.aside.querySelector(`#details_${ dir }`)
									asideMenu.open = 'true'
									let summary = asideMenu.querySelector('summary')
									while (summary.nextElementSibling)
										asideMenu.removeChild(summary.nextElementSibling)
									this.folders.map((f) => {
										if (f._id) {
											let det = asideMenu.appendChild(document.createElement('details'))
											det.id = `details_${ f._id }`
											let sum = det.appendChild(document.createElement('summary'))
											sum.textContent = f.name
											sum.onclick = () => this.changeDirectory(f._id)
										}
									})
								}

								Array.from(this.aside.querySelectorAll('details')).map((d) => {
									if (d.id == `details_${ this.directory }`) {
										// if (d.querySelector('details'))
										// 	Array.from(d.querySelectorAll('details')).map((e) => {e.classList.add('active')})
										d.querySelector('summary').classList.add('active')
									}
									else {
										// if (d.querySelector('details'))
										// 	Array.from(d.querySelectorAll('details')).map((e) => {e.classList.remove('active')})
										d.querySelector('summary').classList.remove('active')
									}
								})
							})
							.finally(() => {
								loadingLock = false
							})
					}
				}

				this.maximize = () => {
					this.maximized = !this.maximized
					let cStyle = this.screen.style
					this.screen.style.transition = '.4s'
					if (this.maximized) {
						cStyle.left = '0'
						cStyle.top = '0'
						cStyle.width = '100%'
						cStyle.height = '100vh'
					}
					else {
						cStyle.left = ''
						cStyle.top = ''
						cStyle.width = ''
						cStyle.height = ''
					}
					let endedEvents = 0
					const rmTransition = () => {
						if (++endedEvents == 4) {
							this.screen.removeEventListener('transitionend', rmTransition)
							this.screen.style.transition = ''
						}
					}
					this.screen.addEventListener('transitionend', rmTransition)
				}

				this.close = () => {
					const rmThis = () => {
						this.screen.removeEventListener('animationend', rmThis)
						this.desktop.removeChild(this)
					}
					this.screen.style.animation = 'close .4s ease-in'
					this.screen.addEventListener('animationend', rmThis)
				}

				this.rmFolderFocus = (e) => {
					let mx = e.touches ? e.touches[e.touches.length - 1].clientX : e.clientX
					let my = e.touches ? e.touches[e.touches.length - 1].clientY : e.clientY

					if (this.shadowRoot.elementFromPoint(mx, my).id == 'section') {
						Array.from(this.section.querySelectorAll('app-folder')).map((folder) => {
							folder.focused = false
						})
					}
				}

				this.changeDirectory(directory)

				this.asideResizer.style.cursor = 'ew-resize'
				this.asideResizer.onmousedown = () => {this.addEventListener('mousemove', this.resizeAside)}
				this.asideResizer.ontouchstart = () => {this.addEventListener('touchmove', this.resizeAside)}

				this.resizeAside = (e) => {
					this.aside.style.width = (e.touches ? e.touches[e.touches.length - 1].clientX : e.clientX) - this.screen.offsetLeft + 'px'
				}

				this.stopAsideReisizing = () => {
					this.removeEventListener('mousemove', this.resizeAside)
					this.removeEventListener('touchmove', this.resizeAside)
				}
				this.addEventListener('mouseup', this.stopAsideReisizing)
				this.addEventListener('touchend', this.stopAsideReisizing)

				ZION(this)
			})
	}
}

customElements.define('zion-explorer', Explorer)
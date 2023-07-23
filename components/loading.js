const style = document.createElement('style')
style.textContent = /*css*/`
	#loadingWrapper {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: #080808d8;
		/*display: none;*/
		z-index: 7;
	}

	img {
		width: 3em;
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%,-50%);
		user-select: none;
		-webkit-user-drag: none;
	}
`
const template = document.createElement('template')
template.innerHTML = /*html*/`
	<div id="loadingWrapper" z-if="loading" enter-animation="fadeIn .2s linear" leave-animation="fadeOut .2s linear">
		<img src="./assets/loading.svg">
	</div>
`

export default class zionLoading extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		this.shadowRoot.appendChild(style.cloneNode(true))
		this.shadowRoot.appendChild(template.content.cloneNode(true))

		this.loading = false
	}
}

customElements.define('zion-loading', zionLoading)
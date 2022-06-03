const style = document.createElement('style')
style.textContent = /*css*/`
	.view {
		width: 90%;
		max-width: 800px;
		margin: auto;
		padding: 73px 0;
		transform-style: preserve-3d;
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: center;
		gap: 33px;
		text-align: center;
	}

	.view > div {
		flex: 1;
		min-width: 300px;
		max-width: 460px;
	}

	.welcomeDiv {
		padding-top: 27px;
	}

	h1 {
		font-size: 1.6em;
	}

	p {
		margin: 13px 0;
	}

	form {
		background: var(--darkgray4);
		padding: 13px;
		border-radius: .5rem;
		box-shadow: 0 0 5px var(--darkgray2);
		width: 100%;
		margin: 0;
		display: flex;
		flex-direction: column;
	}

	@media (min-width: 704px) {
		.welcomeDiv,
		.welcomeDiv h1 {
			text-align: right;
		}
	}

	@keyframes rollFromRight {
		from {
			transform: perspective(750vw) translate(33.3%, 0) rotateY(90deg);
			opacity: 0;
		}
	}

	@keyframes rollFromLeft {
		from {
			transform: perspective(750vw) translate(-33.3%, 0) rotateY(-90deg);
			opacity: 0;
		}
	}

	@keyframes rollToLeft {
		to {
			transform: perspective(750vw) translate(-33.3%, 0) rotateY(-90deg);
			opacity: 0;
		}
	}

	@keyframes rollToRight {
		to {
			transform: perspective(750vw) translate(33.3%, 0) rotateY(90deg);
			opacity: 0;
		}
	}
`
const template = document.createElement('template')
template.innerHTML = /*html*/`
	<div id="login" class="view" z-if="hasAccount" enter-animation="rollFromLeft .5s ease-out" leave-animation="rollToLeft .3s ease-in">
		<div class="welcomeDiv">
			<h1>Boas vindas!</h1>
			<p>
				Faça login em sua conta <b>Razion</b><br/> e organize seus favoritos <i>like a boss</i> com o <b>Razion Web Desktop</b>!
			</p>
		</div>
		<div>
			<form id="loginForm" action="javascript:void(0)" z-onsubmit="login">
				<label class="inputWrapper">
					<input type="email" placeholder="#" id="loginEmailInput" z-model="user.email" onfocus="removeErrMsg('email')" autocomplete="email">
					<b>E-mail</b>
				</label>
				<label class="inputWrapper">
					<input type="password" placeholder="#" z-model="user.password" onfocus="removeErrMsg('password')" autocomplete="password">
					<b>Senha</b>
				</label>
				<button type="submit" class="blueBt">Entrar</button>
			</form>
			<p>
				Ainda não tem um cadastro?<br/>
				<a href="javascript:void(0)" z-onclick="()=>this.hasAccount=false">Clique aqui</a> e cadastre-se gratuitamente!
			</p>
		</div>
	</div>

	<div id="signup" class="view" z-else enter-animation="rollFromRight .5s ease-out" leave-animation="rollToRight .3s ease-in">
		<div class="welcomeDiv">
			<h1>Uma conta, todas as vantagens!</h1>
			<p>
				Com uma única conta você tem acesso gratuito a todos os<br/> produtos oferecidos pela <b>Razion</b>!
			</p>
		</div>
		<div>
			<form id="signupForm" action="javascript:void(0)" z-onsubmit="signup">
				<label class="inputWrapper">
					<input type="text" placeholder="Nome" z-model="user.name" onfocus="removeErrMsg('name')" autocomplete="name">
					<b>Nome</b>
				</label>	
				<label class="inputWrapper">
					<input type="email" id="signupEmailInput" placeholder="E-mail" z-model="user.email" onfocus="removeErrMsg('email')" autocomplete="email">
					<b>E-mail</b>
				</label>
				<label class="inputWrapper">
					<input type="password" placeholder="Senha" z-model="user.password" onfocus="removeErrMsg('password')" autocomplete="password">
					<b>Senha</b>
				</label>
				<label class="inputWrapper">
					<input type="password" placeholder="Confirme a senha" z-model="user.confirmPassword" onfocus="removeErrMsg('confirmPassword')" autocomplete="password-confirmation">
					<b>Confirme a senha</b>
				</label>
				<button type="submit" class="blueBt">Cadastrar</button>
			</form>
			<p>
				Já tem um cadastro?<br/>
				<a href="javascript:void(0)" z-onclick="()=>this.hasAccount=true">Clique aqui</a> para entrar!
			</p>
		</div>
	</div>
`

export default class Home extends HTMLElement {
	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		document.body.style.background = 'var(--darkgray3)'
		this.shadowRoot.appendChild(style.cloneNode(true))
		this.shadowRoot.appendChild(template.content.cloneNode(true))

		this.watch = {
			hasAccount: () => {
				errorMsg.closeAll()
			}
		}

		this.hasAccount = true
		this.user = {
			name: '',
			email: '',
			password: '',
			confirmPassword: ''
		}

		this.login = () => {
			if (errorMsg.getMessages().length) {
				errorMsg.callAttention()
			}
			else {
				if (this.user.password.trim() == '') {
					errorMsg.show({field: 'password', message: 'Digite sua senha'})
				}
				if (this.user.email.trim() == '') {
					errorMsg.show({field: 'email', message: 'Informe seu email'})
				}
				if (!this.shadowRoot.querySelector('#loginEmailInput').checkValidity()) {
					errorMsg.show({field: 'email', message: 'Email inválido'})
				}
				if (!errorMsg.getMessages().length) {
					zPost('https://razion-apis.herokuapp.com/session/login', {
						email: this.user.email,
						password: this.user.password
					})
						.then((res) => {
							// console.log('res', res)
							app.user = res.user
							localStorage.setItem('Razion.user', JSON.stringify(app.user))
							location.hash = '#/desktop'
						})
						.catch((err) => {
							// console.error('err', err)
							errorMsg.show({field: err.field, message: err.error})
						})
				}
			}
		}

		this.signup = () => {
			if (errorMsg.getMessages().length) {
				errorMsg.callAttention()
			}
			else {
				if (this.user.password != this.user.confirmPassword)
					errorMsg.show({field: 'confirmPassword', message: 'As senhas não coincidem'})
				if (this.user.confirmPassword.trim() == '')
					errorMsg.show({field: 'confirmPassword', message: 'Confirme sua senha'})
				if (this.user.password.trim() == '')
					errorMsg.show({field: 'password', message: 'Digite sua senha'})
				if (this.user.email.trim() == '')
					errorMsg.show({field: 'email', message: 'Informe seu email'})
				if (!this.shadowRoot.querySelector('#signupEmailInput').checkValidity())
					errorMsg.show({field: 'email', message: 'Email inválido'})
				if (this.user.name.trim() == '')
					errorMsg.show({field: 'name', message: 'Informe seu nome'})
				if (!errorMsg.getMessages().length) {
					zPost('https://razion-apis.herokuapp.com/session/signup', {
						name: this.user.name,
						email: this.user.email,
						password: this.user.password
					})
						.then((res) => {
							// console.log('res', res)
							this.login()
						})
						.catch((err) => {
							// console.error('err', err)
							errorMsg.show({field: err.field, message: err.error})
						})
				}
			}
		}
	}
}

customElements.define('view-home', Home)
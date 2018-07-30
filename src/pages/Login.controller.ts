import Vue from 'vue';
import Component from 'vue-class-component';

@Component({ name: 'Login' })
export default class Login extends Vue {
  public show: boolean = false;

  public hasError: boolean = false;

  public model = {
    username: '',
    password: '',
  };

  public loginFields = {
    username: { label: 'Username', required: true },
    password: { label: 'Password', type: 'password', required: true },
  };

  public error = {
    message: '',
  };

  public async doLogin() {
    try {
      await this.$store.dispatch('login', {
        username: this.model.username,
        password: this.model.password,
      });

      this.$router.push({ name: 'home' });
    } catch (e) {
      this.hasError = true;

      const response = e.response;

      if (response.status === 401 || response.status === 403) {
        this.error.message = 'Invalid Username or Password';
      } else {
        this.error.message = response.data.error;
      }
    }
  }
}

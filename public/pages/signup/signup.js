const SIGNUP_URL = "/users/signup";

async function handleFormSubmit(event) {
    event.preventDefault();

    const name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    const obj = { name, email, password };

    try {
        const response = await axios.post(SIGNUP_URL, obj);

        console.log("Signup successful:", response.data);

        event.target.reset();

    } catch (error) {
        if (error.response && error.response.status === 403) {
            console.log("User already exists");

            event.target.reset();

        
        } else {
            console.error("Signup failed:", error);
        }
    }
}


const LOGIN_URL = "/users/login";

async function handleLogin(event) {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    const obj = {
        email,
        password
    };

    try {
        const response = await axios.post(LOGIN_URL, obj);

        console.log("Login successful:", response.data);
        event.target.reset();

    } catch (error) {
        console.error("Login failed:", error);

        event.target.reset();
    }
}


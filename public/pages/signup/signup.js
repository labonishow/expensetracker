const SIGNUP_URL = "/user/signup";

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
        console.error("Signup failed:", error);
    }
}
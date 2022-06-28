import axios from "axios";

const instance = axios.create({
  baseURL: "https://dataclean-82e1c.firebaseio.com/",
});

export default instance;
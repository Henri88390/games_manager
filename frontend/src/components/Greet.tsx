import { useEffect, useState } from "react";
import { fetchGreet } from "../api/greet";

function Greet() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchGreet()
      .then((data) => setMessage(data.message))
      .catch((_) => setMessage("ERROR"));
  }, []);

  return <div>{message}</div>;
}

export default Greet;

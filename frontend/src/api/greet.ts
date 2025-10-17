export async function fetchGreet() {
  const response = await fetch("http://localhost:3000/api/greet");
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
}

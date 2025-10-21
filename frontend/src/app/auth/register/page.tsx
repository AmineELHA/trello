import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { client } from "../../lib/graphqlClient";
import { REGISTER_USER } from "../../graphql/mutations";
import { useRouter } from "next/navigation";

interface RegisterInput {
  email: string;
  password: string;
}

interface RegisterResponse {
  registerUser: {
    user: { id: number; email: string };
    token: string;
    errors: string[];
  };
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const mutation = useMutation<RegisterResponse, Error, RegisterInput>(
    async ({ email, password }) => {
      return client.request<RegisterResponse>(REGISTER_USER, {
        email,
        password,
      });
    },
    {
      onSuccess: (res) => {
        if (res.registerUser.errors.length === 0) {
          localStorage.setItem("token", res.registerUser.token);
          router.push("/"); // redirect to dashboard or boards page
        } else {
          alert(res.registerUser.errors.join(", "));
        }
      },
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ email, password }); // ✅ pass as object
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 p-4 border rounded"
    >
      <h1 className="text-xl font-bold mb-4">Sign Up</h1>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 mb-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 mb-4 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded"
      >
        Sign Up
      </button>
    </form>
  );
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom"
import { Bot, Chrome } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
import { useState } from "react"

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema)
  });

  const handleEmailSignup = async (data: SignupFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        }
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Bot className="mx-auto h-8 w-8 text-blue-600" />
          <CardTitle className="mt-2 font-display">Create an Account</CardTitle>
          <CardDescription>Enter your information to get started</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold">Check your email!</h3>
              <p className="text-sm text-muted-foreground mt-2">We've sent a confirmation link to your email address. Please click the link to complete your registration.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleEmailSignup)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" placeholder="Max Robinson" {...register("fullName")} />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleGoogleSignup} type="button">
                <Chrome className="mr-2 h-4 w-4" /> Sign up with Google
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default SignupPage;

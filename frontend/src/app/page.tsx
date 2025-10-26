"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MotionCard } from "@/components/ui/motion-card";
import { Github, Menu, X, Users, LayoutDashboard, Calendar, Bell, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  // Check if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setAuthChecked(true);
  }, []);
  
  const handleCreateBoardClick = () => {
    if (isAuthenticated) {
      router.push("/boards");
    } else {
      router.push("/auth/register");
    }
  };
  
  const handleSignInClick = () => {
    if (isAuthenticated) {
      router.push("/boards");
    } else {
      router.push("/auth/login");
    }
  };

  // Navigation items
  const navItems = [
    { name: "Home", href: "#" },
    { name: "Boards", href: "/boards" },
    { name: "Teams", href: "#" },
    { name: "Pricing", href: "#" },
  ];

  // Features based on the actual app features
  const features = [
    {
      icon: LayoutDashboard,
      title: "Boards & Lists",
      description: "Organize your work with customizable boards and lists. Create as many boards as you need.",
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Invite team members to collaborate on boards in real-time. Share tasks and work together.",
    },
    {
      icon: Calendar,
      title: "Task Management",
      description: "Create, assign, and track tasks with due dates, descriptions, and status updates.",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Stay updated with notifications about changes, comments, and important updates.",
    },
  ];

  // Example boards data
  const exampleBoards = [
    {
      id: 1,
      name: "Project Roadmap",
      tasks: 12,
      members: 4,
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Design Tasks",
      tasks: 8,
      members: 3,
      color: "bg-green-500",
    },
    {
      id: 3,
      name: "Development",
      tasks: 15,
      members: 6,
      color: "bg-purple-500",
    },
    {
      id: 4,
      name: "Marketing",
      tasks: 6,
      members: 2,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Trello Clone</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {authChecked ? (
              isAuthenticated ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Link href="/boards">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        View Boards
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <button 
                      onClick={() => {
                        localStorage.removeItem("token");
                        router.push("/");
                        setIsAuthenticated(false);
                      }}
                      className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 px-3 py-2 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Link href="/auth/login">
                      <Button variant="ghost" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400" onClick={(e) => {
                        e.preventDefault();
                        handleSignInClick();
                      }}>Login</Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <Link href="/auth/register">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">Sign Up Free</Button>
                    </Link>
                  </motion.div>
                </>
              )
            ) : (
              // Show loading state while checking auth
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Button variant="outline" disabled>
                  Loading...
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden border-t bg-white dark:bg-gray-900"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container py-4 flex flex-col gap-3 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 py-2 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t">
                {authChecked ? (
                  isAuthenticated ? (
                    <>
                      <Link href="/boards">
                        <Button variant="outline" className="w-full text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">View Boards</Button>
                      </Link>
                      <button 
                        onClick={() => {
                          localStorage.removeItem("token");
                          router.push("/");
                          setIsAuthenticated(false);
                          setMobileMenuOpen(false); // Close mobile menu after sign out
                        }}
                        className="w-full text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 rounded-md"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login">
                        <Button variant="outline" className="w-full text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400" onClick={(e) => {
                          e.preventDefault();
                          handleSignInClick();
                        }}>Login</Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Sign Up Free</Button>
                      </Link>
                    </>
                  )
                ) : (
                  // Show loading state while checking auth
                  <Button variant="outline" className="w-full" disabled>
                    Loading...
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="flex flex-col items-center text-center space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Organize your projects, your way
                </motion.h1>
                <motion.p 
                  className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  A simple and intuitive project management tool that helps you organize tasks, collaborate with teams, and bring your ideas to life.
                </motion.p>
              </motion.div>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    className="px-8 py-6 text-base bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleCreateBoardClick}
                  >
                    Create a Board
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="px-8 py-6 text-base border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      if (isAuthenticated) {
                        router.push("/boards");
                      } else {
                        router.push("/auth/login");
                      }
                    }}
                  >
                    {isAuthenticated ? "Go to Boards" : "Sign In"}
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="mt-12 max-w-4xl w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="rounded-xl p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                  <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-t-lg">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-b-lg">
                    <div className="flex gap-4 flex-wrap">
                      {/* Board Example */}
                      <div className="flex-1 min-w-[200px] max-w-xs">
                        <div className="font-semibold mb-3 text-gray-700 dark:text-gray-300">To Do</div>
                        <div className="space-y-2">
                          <motion.div 
                            className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg border border-blue-100 dark:border-blue-800"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.02, x: -5 }}
                            transition={{ duration: 0.3, delay: 0.7 }}
                          >
                            Plan project scope
                          </motion.div>
                          <motion.div 
                            className="p-3 bg-green-50 dark:bg-green-900/50 rounded-lg border border-green-100 dark:border-green-800"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.02, x: -5 }}
                            transition={{ duration: 0.3, delay: 0.8 }}
                          >
                            Research competitors
                          </motion.div>
                          <motion.div 
                            className="p-3 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg border border-yellow-100 dark:border-yellow-800"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.02, x: -5 }}
                            transition={{ duration: 0.3, delay: 0.9 }}
                          >
                            Define requirements
                          </motion.div>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-[200px] max-w-xs">
                        <div className="font-semibold mb-3 text-gray-700 dark:text-gray-300">In Progress</div>
                        <div className="space-y-2">
                          <motion.div 
                            className="p-3 bg-purple-50 dark:bg-purple-900/50 rounded-lg border border-purple-100 dark:border-purple-800"
                            initial={{ opacity: 0, x: 0 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3, delay: 1.0 }}
                          >
                            Create wireframes
                          </motion.div>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-[200px] max-w-xs">
                        <div className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Done</div>
                        <div className="space-y-2">
                          <motion.div 
                            className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            transition={{ duration: 0.3, delay: 1.1 }}
                          >
                            Set up project
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Powerful Features</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Everything you need to organize, collaborate, and get more done
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow h-full bg-white dark:bg-gray-800">
                    <CardHeader>
                      <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3 w-12 h-12 flex items-center justify-center mb-4">
                        <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-gray-900 dark:text-white">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Example Boards Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">See It In Action</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Get inspired by how our users organize their work with boards
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {exampleBoards.map((board, index) => (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <MotionCard 
                    className="border border-gray-200 dark:border-gray-700 transition-transform hover:scale-[1.02] h-full bg-white dark:bg-gray-800"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className={`${board.color} rounded-t-lg h-2`}></div>
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">{board.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                        <span>{board.tasks} tasks</span>
                        <span>{board.members} members</span>
                      </div>
                    </CardContent>
                  </MotionCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-500 rounded-lg">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">Trello Clone</span>
              </div>
              <p className="text-gray-400 text-sm">
                A simple and intuitive project management tool for teams of all sizes.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="text-sm font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Tutorials</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <h3 className="text-sm font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Partners</Link></li>
              </ul>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center"
          >
            <p className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2025 Trello Clone. All rights reserved.
            </p>
            
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
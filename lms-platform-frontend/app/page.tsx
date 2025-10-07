"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image" // Assuming you have an Image component for the logo
import {
  Search,
  ShoppingCart,
  Menu, // For mobile hamburger menu
  // Other icons as needed for categories
} from "lucide-react"
import { Typewriter } from "react-simple-typewriter"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Input } from "@/components/ui/input" // Assuming you have a shadcn/ui input
import { Button } from "@/components/ui/button" // Assuming you have a shadcn/ui button
import { Separator } from "@/components/ui/separator" // Might be useful for dividers
import SplashCursor from "@/src/blocks/Animations/SplashCursor/SplashCursor"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const Instructors = [{
  imageURL: '/workspaces/LMS-Platform/lms-platform-frontend/public/logo.jpg',
  name: 'Alex Peterson'
},
{
  imageURL: '/workspaces/LMS-Platform/lms-platform-frontend/public/logo.jpg',
  name: 'Alex Peterson'
},
{
  imageURL: '/workspaces/LMS-Platform/lms-platform-frontend/public/logo.jpg',
  name: 'Jason dorsy'
},
{
  imageURL: '/workspaces/LMS-Platform/lms-platform-frontend/public/logo.jpg',
  name: 'Lily watson'
},
{
  imageURL: '/workspaces/LMS-Platform/lms-platform-frontend/public/logo.jpg',
  name: 'Aliertar cook'
}
]

const coursesList = [{
  imageURL: '/workspaces/LMS-Platform/lms-platform-frontend/public/logo.jpg',
  courseTitle: 'complete ai bootcamp with python and tensorflow.',
  instructors: ['john doe','kate marshal','raj anand'],
  ratings: 4.3,
  number_of_people_rated: 2000,
  price: 500,
  tag: 'premium'
},{
  imageURL: '/workspaces/LMS-Platform/lms-platform-frontend/public/logo.jpg',
  courseTitle: 'complete ai bootcamp with python and tensorflow.',
  instructors: ['john doe','kate marshal','raj anand'],
  ratings: 4.3,
  number_of_people_rated: 2000,
  price: 500,
  tag: 'premium'
},{
  imageURL: '/workspaces/LMS-Platform/lms-platform-frontend/public/logo.jpg',
  courseTitle: 'complete ai bootcamp with python and tensorflow.',
  instructors: ['john doe','kate marshal','raj anand'],
  ratings: 4.3,
  number_of_people_rated: 2000,
  price: 500,
  tag: 'premium'
},{
  imageURL: '/workspaces/LMS-Platform/lms-platform-frontend/public/logo.jpg',
  courseTitle: 'complete ai bootcamp with python and tensorflow.',
  instructors: ['john doe','kate marshal','raj anand'],
  ratings: 4.3,
  number_of_people_rated: 2000,
  price: 500,
  tag: 'premium'
}]

const reviews = [
  {
    name: "Anjali Verma",
    title: "Software Developer @ TCS",
    review:
      "Thanks to this course, I cracked my first tech interview. The content was well-structured and hands-on!",
  },
  {
    name: "Rahul Singh",
    title: "Data Analyst @ Accenture",
    review:
      "The data science modules were exactly what I needed. The instructors explain complex topics so clearly.",
  },
  {
    name: "Sneha Kapoor",
    title: "Fullstack Developer @ Infosys",
    review:
      "The fullstack bootcamp got me ready for real-world projects. The mock interviews and assignments were gold!",
  },
  {
    name: "Mohit Rao",
    title: "Cloud Engineer @ AWS Partner",
    review:
      "I used the AWS modules in my certification prep. I’m now a certified cloud practitioner!",
  },
  {
    name: "Divya Mehra",
    title: "ML Intern @ StartUpX",
    review:
      "As a beginner, I was nervous about AI/ML, but this course walked me through with confidence.",
  },
  {
    name: "Rajat Khanna",
    title: "Cybersecurity Analyst @ Deloitte",
    review:
      "The practical labs and scenario-based learning in cybersecurity were top-notch. Loved it!",
  },
  {
    name: "Anjali Verma",
    title: "Software Developer @ TCS",
    review:
      "Thanks to this course, I cracked my first tech interview. The content was well-structured and hands-on!",
  },
  {
    name: "Rahul Singh",
    title: "Data Analyst @ Accenture",
    review:
      "The data science modules were exactly what I needed. The instructors explain complex topics so clearly.",
  },
  {
    name: "Sneha Kapoor",
    title: "Fullstack Developer @ Infosys",
    review:
      "The fullstack bootcamp got me ready for real-world projects. The mock interviews and assignments were gold!",
  },
  {
    name: "Mohit Rao",
    title: "Cloud Engineer @ AWS Partner",
    review:
      "I used the AWS modules in my certification prep. I’m now a certified cloud practitioner!",
  },
  {
    name: "Divya Mehra",
    title: "ML Intern @ StartUpX",
    review:
      "As a beginner, I was nervous about AI/ML, but this course walked me through with confidence.",
  },
  {
    name: "Rajat Khanna",
    title: "Cybersecurity Analyst @ Deloitte",
    review:
      "The practical labs and scenario-based learning in cybersecurity were top-notch. Loved it!",
  },
  {
    name: "Anjali Verma",
    title: "Software Developer @ TCS",
    review:
      "Thanks to this course, I cracked my first tech interview. The content was well-structured and hands-on!",
  },
  {
    name: "Rahul Singh",
    title: "Data Analyst @ Accenture",
    review:
      "The data science modules were exactly what I needed. The instructors explain complex topics so clearly.",
  },
  {
    name: "Sneha Kapoor",
    title: "Fullstack Developer @ Infosys",
    review:
      "The fullstack bootcamp got me ready for real-world projects. The mock interviews and assignments were gold!",
  },
  {
    name: "Mohit Rao",
    title: "Cloud Engineer @ AWS Partner",
    review:
      "I used the AWS modules in my certification prep. I’m now a certified cloud practitioner!",
  },
  {
    name: "Divya Mehra",
    title: "ML Intern @ StartUpX",
    review:
      "As a beginner, I was nervous about AI/ML, but this course walked me through with confidence.",
  },
  {
    name: "Rajat Khanna",
    title: "Cybersecurity Analyst @ Deloitte",
    review:
      "The practical labs and scenario-based learning in cybersecurity were top-notch. Loved it!",
  },
  {
    name: "Anjali Verma",
    title: "Software Developer @ TCS",
    review:
      "Thanks to this course, I cracked my first tech interview. The content was well-structured and hands-on!",
  },
  {
    name: "Rahul Singh",
    title: "Data Analyst @ Accenture",
    review:
      "The data science modules were exactly what I needed. The instructors explain complex topics so clearly.",
  },
  {
    name: "Sneha Kapoor",
    title: "Fullstack Developer @ Infosys",
    review:
      "The fullstack bootcamp got me ready for real-world projects. The mock interviews and assignments were gold!",
  },
  {
    name: "Mohit Rao",
    title: "Cloud Engineer @ AWS Partner",
    review:
      "I used the AWS modules in my certification prep. I’m now a certified cloud practitioner!",
  },
  {
    name: "Divya Mehra",
    title: "ML Intern @ StartUpX",
    review:
      "As a beginner, I was nervous about AI/ML, but this course walked me through with confidence.",
  },
  {
    name: "Rajat Khanna",
    title: "Cybersecurity Analyst @ Deloitte",
    review:
      "The practical labs and scenario-based learning in cybersecurity were top-notch. Loved it!",
  },
  {
    name: "Anjali Verma",
    title: "Software Developer @ TCS",
    review:
      "Thanks to this course, I cracked my first tech interview. The content was well-structured and hands-on!",
  },
  {
    name: "Rahul Singh",
    title: "Data Analyst @ Accenture",
    review:
      "The data science modules were exactly what I needed. The instructors explain complex topics so clearly.",
  },
  {
    name: "Sneha Kapoor",
    title: "Fullstack Developer @ Infosys",
    review:
      "The fullstack bootcamp got me ready for real-world projects. The mock interviews and assignments were gold!",
  },
  {
    name: "Mohit Rao",
    title: "Cloud Engineer @ AWS Partner",
    review:
      "I used the AWS modules in my certification prep. I’m now a certified cloud practitioner!",
  },
  {
    name: "Divya Mehra",
    title: "ML Intern @ StartUpX",
    review:
      "As a beginner, I was nervous about AI/ML, but this course walked me through with confidence.",
  },
  {
    name: "Rajat Khanna",
    title: "Cybersecurity Analyst @ Deloitte",
    review:
      "The practical labs and scenario-based learning in cybersecurity were top-notch. Loved it!",
  }
  // Add more if needed
];

// Utility function to group reviews into chunks of 5
const chunk = (arr: any[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

const reviewChunks = chunk(reviews, 5);

// Dummy data for categories, mimicking Udemy's structure
const categories = [
  {
    title: "Development",
    href: "/categories/development",
    subcategories: [
      { title: "Web Development", href: "#" },
      { title: "Data Science", href: "#" },
      // ... more
    ],
  },
  {
    title: "Business",
    href: "/categories/business",
    subcategories: [
      { title: "Entrepreneurship", href: "#" },
      { title: "Communication", href: "#" },
      // ... more
    ],
  },
  // ... more main categories
]

// ListItem component remains largely the same, but styling might be adjusted for sub-menus
function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & { href: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

export default function UdemyNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <div>
      <div
      className='flex w-full h-20 justify-center items-center bg-orange-600'
      >Sale is on get 50% off</div>
    <nav className="left-0 w-full bg-[#090818] text-white shadow-md z-50">
      <NavigationMenu className="max-w-screen-xl mx-auto px-4 py-3 h-16 flex items-center justify-between">
        {/* Left Section: Logo, Categories, Search */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle (Hamburger Icon) */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            {/* Replace with your Udemy-style logo image */}
            {/* <Image
              src="/udemy-logo.svg" // Path to your Udemy logo
              alt="Udemy Logo"
              width={91} // Adjust width and height as needed
              height={32}
              priority
            /> */}
          </Link>

          {/* Categories Dropdown (Desktop Only) */}
          <NavigationMenuList className="hidden md:flex z-50">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent hover:bg-transparent data-[state=open]:bg-transparent focus:bg-transparent">
                Categories
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => (
                    <div key={category.title}>
                      <ListItem title={category.title} href={category.href}>
                        {/* Optional description for main category */}
                      </ListItem>
                      <ul className="pl-4 mt-1 space-y-1">
                        {category.subcategories.map((sub) => (
                          <ListItem
                            key={sub.title}
                            title={sub.title}
                            href={sub.href}
                            className="text-muted-foreground hover:text-white" // Adjust text color for subcategories
                          />
                        ))}
                      </ul>
                    </div>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>

          {/* Search Bar (Desktop Only) */}
          <div className="relative flex items-center hidden md:flex w-96">
            <Search className="absolute left-3 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for anything"
              className="pl-10 pr-4 py-2 rounded-full bg-[#3c4852] border border-transparent focus:border-white text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right Section: Udemy Business, Teach, Cart, Login, Signup */}
        <div className="flex items-center gap-4">
          <Link href="/udemy-business" className="hidden lg:block text-white text-sm hover:text-gray-300">
            Udemy Business
          </Link>
          <Link href="/teach-on-udemy" className="hidden lg:block text-white text-sm hover:text-gray-300">
            Teach on Udemy
          </Link>
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-700">
            <ShoppingCart className="h-6 w-6 text-white" />
            {/* You might add a badge here for item count */}
          </Link>

          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#29303b] px-4 py-2 rounded-sm text-sm font-bold hidden md:block">
            Log in
          </Button>
          <Button className="bg-[#a435f0] hover:bg-[#8e29d7] text-white px-4 py-2 rounded-sm text-sm font-bold hidden md:block">
            Sign up
          </Button>
        </div>
      </NavigationMenu>

      {/* Mobile Menu Overlay (Conditional Rendering) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-[#29303b] z-40 p-4">
          <div className="flex justify-end">
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-white text-xl">
              &times;
            </button>
          </div>
          <ul className="mt-8 space-y-4">
            <li>
              <Link href="/categories" className="block text-white text-lg font-bold">
                Categories
              </Link>
            </li>
            <li>
              <Link href="/udemy-business" className="block text-white text-lg font-bold">
                Udemy Business
              </Link>
            </li>
            <li>
              <Link href="/teach-on-udemy" className="block text-white text-lg font-bold">
                Teach on Udemy
              </Link>
            </li>
            {/* Add more mobile menu items here, including login/signup buttons */}
            <li>
              <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-[#29303b] px-4 py-2 rounded-sm text-base font-bold mt-4">
                Log in
              </Button>
            </li>
            <li>
              <Button className="w-full bg-[#a435f0] hover:bg-[#8e29d7] text-white px-4 py-2 rounded-sm text-base font-bold mt-2">
                Sign up
              </Button>
            </li>
          </ul>
        </div>
      )}
    </nav>
   <div className="relative h-96 w-full bg-[#090818] flex justify-center items-center text-white overflow-hidden">
      
      {/* Main Text + Animation in Column */}
      <div className="z-10 flex flex-col items-center text-center space-y-4 text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
        <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text drop-shadow-lg">
          LEARN
        </div>
        
        <div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text drop-shadow-lg">
          <Typewriter
            words={[
              "Machine Learning",
              "Business",
              "Microsoft Office",
              "Python",
              "Cybersecurity",
              "Fullstack Development",
            ]}
            loop={0}
            cursor
            cursorStyle="_"
            typeSpeed={80}
            deleteSpeed={60}
            delaySpeed={2000}
          />
        </div>
        
        <Button className="text-lg px-6 py-3 mt-4">Explore</Button>
      </div>

      {/* Splash Effect Layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          clipPath: "inset(0)",
          isolation: "isolate",
        }}
      >
        {/* {best splash cursor} */}
        <SplashCursor
          SIM_RESOLUTION={512}
          DYE_RESOLUTION={2048}
          DENSITY_DISSIPATION={0.3}
          VELOCITY_DISSIPATION={0.9}
          PRESSURE={0.6}
          CURL={45}
          SPLAT_RADIUS={0.2}
          SPLAT_FORCE={6000}
          SHADING={false}
          COLOR_UPDATE_SPEED={2}
          BACK_COLOR={{ r: 0.0, g: 0.0, b: 0.0 }}
          TRANSPARENT={false}
        />

      </div>
    </div>

{/* Courses Section */}
<section className="w-full bg-[#f8fafc] py-12 px-4 md:px-16">
  <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Explore Our Courses</h2>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
    {coursesList.map((item, index) => (
      <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="h-48 relative w-full">
          <Image
            src={item.imageURL}
            alt={item.courseTitle}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.courseTitle}</h3>
          
          <p className="text-sm text-gray-600 mt-1">
            {item.instructors.join(", ")}
          </p>
          
          <div className="mt-2 flex items-center text-yellow-500 text-sm">
            <span className="mr-1">{item.ratings} ⭐</span>
            <span className="text-gray-500">({item.number_of_people_rated})</span>
          </div>
          
          <div className="mt-2 text-md font-bold text-purple-700">
            ₹{item.price}
          </div>
          
          <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full uppercase tracking-wide">
            {item.tag}
          </span>
        </div>
      </div>
    ))}
  </div>
</section>
        <div className="max-w-screen-xl mx-auto px-4 py-12">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
        Hear it from our Learners
      </h2>

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        loop={true}
        pagination={{ clickable: true }}
        navigation
        spaceBetween={30}
        breakpoints={{
          320: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {reviews.map((review, index) => (
          <SwiperSlide key={index}>
            <div className="bg-[#1e1e2f] rounded-xl shadow-lg p-6 h-fit flex flex-col justify-between text-white">
              <div className="text-lg font-semibold">{review.name}</div>
              <div className="text-sm text-violet-300 italic">{review.title}</div>
              <p className="mt-4 text-base text-gray-300 line-clamp-5">{review.review}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
{/* ✅ Instructors Carousel */}
      <div className='w-full px-4 py-12 bg-[#f4f4f5]'>
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Meet Our Instructors</h2>
        <div className='flex flex-wrap justify-evenly items-center gap-8'>
          {Instructors.map((item, index) => (
            <div key={index} className="flex flex-col items-center space-y-">
              <Image
                className="rounded-full border-2 border-violet-600"
                src={item.imageURL}
                alt='Instructor'
                width={200}
                height={200}
              />
              <p className="text-sm font-semibold text-gray-800">{item.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Footer */}
<footer className="bg-violet-900 text-gray-100 pt-12 pb-8 px-4 md:px-16">
  <div className="max-w-screen-xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
    
    {/* Company */}
    <div>
      <h3 className="font-bold text-lg mb-4 text-white">Company</h3>
      <ul className="space-y-2 text-sm">
        <li><Link href="/about">About Us</Link></li>
        <li><Link href="/careers">Careers</Link></li>
        <li><Link href="/instructors">Become an Instructor</Link></li>
        <li><Link href="/blog">Blog</Link></li>
        <li><Link href="/affiliates">Affiliate Program</Link></li>
      </ul>
    </div>

    {/* Certification Courses */}
    <div>
      <h3 className="font-bold text-lg mb-4 text-white">Certification Courses</h3>
      <ul className="space-y-2 text-sm">
        <li><Link href="/certifications/aws">AWS Certified Cloud Practitioner</Link></li>
        <li><Link href="/certifications/data-science">Data Science Certification</Link></li>
        <li><Link href="/certifications/fullstack">Fullstack Developer Bootcamp</Link></li>
        <li><Link href="/certifications/cybersecurity">Cybersecurity Foundation</Link></li>
        <li><Link href="/certifications/python">Python for Everyone</Link></li>
      </ul>
    </div>

    {/* Resources */}
    <div>
      <h3 className="font-bold text-lg mb-4 text-white">Resources</h3>
      <ul className="space-y-2 text-sm">
        <li><Link href="/help">Help & Support</Link></li>
        <li><Link href="/faq">FAQs</Link></li>
        <li><Link href="/community">Learner Community</Link></li>
        <li><Link href="/events">Events & Webinars</Link></li>
        <li><Link href="/newsletter">Newsletter Signup</Link></li>
      </ul>
    </div>

    {/* Explore */}
    <div>
      <h3 className="font-bold text-lg mb-4 text-white">Explore</h3>
      <ul className="space-y-2 text-sm">
        <li><Link href="/categories/development">Development</Link></li>
        <li><Link href="/categories/business">Business</Link></li>
        <li><Link href="/categories/design">Design</Link></li>
        <li><Link href="/categories/marketing">Marketing</Link></li>
        <li><Link href="/categories/it">IT & Software</Link></li>
      </ul>
    </div>

    {/* Legal & Social */}
    <div>
      <h3 className="font-bold text-lg mb-4 text-white">Legal</h3>
      <ul className="space-y-2 text-sm">
        <li><Link href="/terms">Terms of Use</Link></li>
        <li><Link href="/privacy">Privacy Policy</Link></li>
        <li><Link href="/cookie">Cookie Policy</Link></li>
        <li><Link href="/security">Security</Link></li>
        <li><Link href="/sitemap">Sitemap</Link></li>
      </ul>
    </div>
  </div>

  {/* Divider */}
  <div className="border-t border-violet-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
    <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} LMS Platform. All rights reserved.</p>
    <div className="flex space-x-4 mt-4 md:mt-0">
      <Link href="https://facebook.com"><img src="/icons/facebook.svg" alt="Facebook" className="h-5 w-5" /></Link>
      <Link href="https://twitter.com"><img src="/icons/twitter.svg" alt="Twitter" className="h-5 w-5" /></Link>
      <Link href="https://linkedin.com"><img src="/icons/linkedin.svg" alt="LinkedIn" className="h-5 w-5" /></Link>
      <Link href="https://youtube.com"><img src="/icons/youtube.svg" alt="YouTube" className="h-5 w-5" /></Link>
    </div>
  </div>
</footer>

    </div>
  )
}
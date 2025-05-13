'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';

import { FiHome } from 'react-icons/fi';
import { BiWalletAlt, BiUser } from 'react-icons/bi';
import { AiOutlineFileSync } from 'react-icons/ai';
import { BsPhone } from 'react-icons/bs';
import { IoMdSwitch } from 'react-icons/io';

export default function Hamburger() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const links = [
    { name: 'Home', href: '/', icon: <FiHome size={18} /> },
    { name: 'Wallet', href: '/wallet', icon: <BiWalletAlt size={18} /> },
    { name: 'Buy Data', href: '/buy-data', icon: <BsPhone size={18} /> },
    { name: 'Transactions', href: '/transaction', icon: <AiOutlineFileSync size={18} /> },
    { name: 'Profile', href: '/profile', icon: <BiUser size={18} /> },
    {
      name: 'Logout',
      icon: <IoMdSwitch size={18} className="text-red-500" />,
      onClick: handleLogout,
    },
  ];

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-800 cursor-pointer focus:outline-none"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg border z-50">
          <ul className="flex flex-col p-2">
            {links.map((link) => (
              <li key={link.name}>
                {link.href ? (
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      link.onClick?.();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    {link.icon}
                    {link.name}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

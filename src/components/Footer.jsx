import React from "react";
import Button from "./Button";
import { socialMedia, aboutMe } from "../constants";
import { layout } from "../style";
import { resumeLink, repoLink } from "../constants";
import { AiFillGithub, AiFillFilePdf } from "react-icons/ai";
import { SiLeetcode } from "react-icons/si";
import { profilePic } from "../assets";

const Footer = () => (
  <footer id="contactMe" className="bg-gray-900 sm:px-16 px-6">
    <div
      className={`${layout.sectionReverse} xl:max-w-[1280px] w-full mx-auto gap-y-4 `}
    >
      <div className={` ${layout.sectionInfo}`}>
        <h2 className="text-xl font-bold text-gray-800 font-poppins dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
          {aboutMe.name}
        </h2>
        <p
          className={`font-poppins font-normal text-dimWhite text-[16px] leading-[30.8px] max-w-[470px] mt-5`}
        >
        {aboutMe.tagLine}
        </p>
        <div className="flex flex-row mt-4">
          {socialMedia.map((social, index) => (
            <a
              href={social.link}
              target="_blank"
              key={social.id}
              index={index}
              className="text-white mr-5 text-[25px] hover:text-purple-300"
            >
              {React.createElement(social.icon)}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <a href={resumeLink} target="_blank">
            <Button
              styles="mt-10 inline-flex items-center justify-center w-full"
              text="Resume"
              icon={AiFillFilePdf}
            />
          </a>
          <a href={repoLink} target="_blank">
            <Button
              styles="mt-10 inline-flex items-center justify-center w-full"
              text="GitHub"
              icon={AiFillGithub}
            />
          </a>
          <a href="https://leetcode.com/u/ibXDVQOY8i/" target="_blank">
            <Button
              styles="mt-10 inline-flex items-center justify-center w-full"
              text="LeetCode"
              icon={SiLeetcode}
            />
          </a>
        </div>
      </div>

      {/* Profile picture — right side */}
      <div className={`${layout.sectionImg} md:flex hidden`}>
        <div className="relative">
          <div className="w-[280px] h-[280px] rounded-full overflow-hidden border-4 border-purple-700 shadow-[0_0_40px_rgba(139,92,246,0.35)]">
            <img
              src={profilePic}
              alt="Avinash Gupta"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-purple-400/20 scale-110 pointer-events-none" />
        </div>
      </div>
    </div>
    <div className="text-center font-poppins font-normal text-dimWhite text-xs sm:text-sm pb-4">
      <p>
        Made with{" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="inline-block w-3.5 h-3.5 "
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
        {" "}by Avinash Gupta
      </p>
    </div>
  </footer>
);

export default Footer;

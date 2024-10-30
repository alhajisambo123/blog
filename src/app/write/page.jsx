"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
  storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "@/utils/firebase"; // Import Firebase storage utilities safely
import "react-quill/dist/quill.bubble.css";
import Image from "next/image";
import styles from "./writePage.module.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const WritePage = () => {
  const { status } = useSession();
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [media, setMedia] = useState("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [catSlug, setCatSlug] = useState("style");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Ensure file upload logic only runs on the client side
  useEffect(() => {
    if (typeof window === "undefined" || !file) return;

    const uploadFile = () => {
      const name = `${new Date().getTime()}-${file.name}`;
      const storageRef = ref(storage, name);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Upload failed:", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setMedia(downloadURL);
        }
      );

      return () => uploadTask.cancel();
    };

    uploadFile();
  }, [file]);

  if (status === "loading")
    return <div className={styles.loading}>Loading...</div>;
  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  const slugify = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        h

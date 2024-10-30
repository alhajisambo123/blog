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
} from "@/utils/firebase";
import "react-quill/dist/quill.bubble.css";
import Image from "next/image";
import styles from "./writePage.module.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const WritePage = () => {
  // Call hooks unconditionally at the top
  const router = useRouter();
  const { status } = useSession();

  const [file, setFile] = useState(null);
  const [media, setMedia] = useState("");
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [catSlug, setCatSlug] = useState("style");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // File upload logic
  useEffect(() => {
    if (!file) return;

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

  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>;
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          desc: value,
          img: media,
          slug: slugify(title),
          catSlug,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/posts/${data.slug}`);
      } else {
        console.error("Failed to create post:", res.statusText);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Title"
        className={styles.input}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select
        className={styles.select}
        value={catSlug}
        onChange={(e) => setCatSlug(e.target.value)}
      >
        <option value="RT">RT</option>
        <option value="MedLab">MedLab</option>
        <option value="Physio">Physio</option>
        <option value="OT">OT</option>
        <option value="Radio">Radio</option>
        <option value="Diet">Diet</option>
      </select>
      <div className={styles.editor}>
        <button className={styles.button} onClick={() => setFile(null)}>
          {/* <Image src="/plus.png" alt="Add Media" width={16} height={16} /> */}
        </button>
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label htmlFor="fileInput" className={styles.addButton}>
          {/* <Image src="/image.png" alt="Upload Image" width={16} height={16} /> */}
        </label>

        <ReactQuill
          className={styles.textArea}
          theme="bubble"
          value={value}
          onChange={setValue}
          placeholder="Tell your story..."
        />
      </div>

      {uploadProgress > 0 && (
        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <button
        className={styles.publish}
        onClick={handleSubmit}
        disabled={isSubmitting || !title || !value || !media}
      >
        {isSubmitting ? "Publishing..." : "Publish"}
      </button>
    </div>
  );
};

export default WritePage;

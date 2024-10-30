"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import styles from "./writePage.module.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.bubble.css";

let storage, ref, uploadBytesResumable, getDownloadURL;

if (typeof window !== "undefined") {
  const firebase = require("@/utils/firebase");
  ({ storage, ref, uploadBytesResumable, getDownloadURL } = firebase);
}

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
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label htmlFor="fileInput" className={styles.addButton}>
          Upload Image
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

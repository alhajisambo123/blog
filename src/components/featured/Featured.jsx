import React from "react";
import styles from "./featured.module.css";
import Image from "next/image";
import Link from "next/link";
Link;

const Featured = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        <b>Welcome to UGAHSA! </b> Empowering the Future of Allied Health
        Professionals
      </h1>
      <div className={styles.post}>
        <div className={styles.imgContainer}>
          <Image src="/(1).jpeg" alt="" fill className={styles.image} />
        </div>
        <div className={styles.textContainer}>
          <h1 className={styles.postTitle}>
            Building a Stronger Tomorrow with UGAHSA!
          </h1>
          <p className={styles.postDesc}>
            Welcome to the official blog of the University of Ghana Allied
            Health Students' Association (UGAHSA)! Here, we share our
            experiences, achievements, and efforts in shaping the future of
            allied health professionals. Whether you’re a current student,
            alumnus, or prospective member, this space is designed to inform,
            inspire, and connect us all.
          </p>

          <Link href={`/about`} className={styles.link}>
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Featured;

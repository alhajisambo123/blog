import Link from "next/link";
import React from "react";
import styles from "./menuCategories.module.css";

const MenuCategories = () => {
  return (
    <div className={styles.categoryList}>
      <Link
        href="/blog?cat=RT"
        className={`${styles.categoryItem} ${styles.style}`}
      >
        RT
      </Link>
      <Link
        href="/blog?cat=MedLab"
        className={`${styles.categoryItem} ${styles.fashion}`}
      >
        Medlab
      </Link>
      <Link
        href="/blog?cat=Physio"
        className={`${styles.categoryItem} ${styles.food}`}
      >
        Physio
      </Link>
      <Link
        href="/blog?cat=Radio"
        className={`${styles.categoryItem} ${styles.travel}`}
      >
        Radio
      </Link>
      <Link
        href="/blog?cat=OT"
        className={`${styles.categoryItem} ${styles.culture}`}
      >
        OT
      </Link>
      <Link
        href="/blog?cat=Diet"
        className={`${styles.categoryItem} ${styles.Diet}`}
      >
        Diet
      </Link>
    </div>
  );
};

export default MenuCategories;

// pages/sitemap.xml.js

import { fetchAllPuklas } from "../lib/operations";

const URL = "https://puk.la";

function generateSiteMap(posts) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${URL}</loc>
       <changefreq>daily</changefreq>
       <priority>1</priority>
     </url>
       <url>
       <loc>${URL}/pricing</loc>
       <changefreq>monthly</changefreq>
       <priority>0.8</priority>
      </url>
      <url>
      <loc>${URL}/contact</loc>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
     </url>
     <url>
     <loc>${URL}/features</loc>
     <changefreq>monthly</changefreq>
     <priority>0.8</priority>
     </url>
     ${posts
       .map(({ slug, updated_at }) => {
         return `
           <url>
               <loc>${`${URL}/${slug}`}</loc>
               <changefreq>monthly</changefreq>
               <lastmod>${new Date(updated_at).toISOString()}</lastmod>
               <priority>0.8</priority>
           </url>
         `;
       })
       .join("")}
   </urlset>
 `;
}

export async function getServerSideProps({ res }) {
  const puklas = await fetchAllPuklas();

  // Generate the XML sitemap with the blog data
  const sitemap = generateSiteMap(puklas);

  res.setHeader("Content-Type", "text/xml");
  // Send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function SiteMap() {}

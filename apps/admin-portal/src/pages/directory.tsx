import { pick } from "lodash";
import { Search } from "lucide-react";
import { GetStaticPropsContext } from "next";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

import { Card, CardContent } from "@/ui/card";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";

import { createClient } from "@/utils/supabase/component";

type Pukla = {
  id: string;
  title: string;
  bio: string | null;
  slug: string;
  avatar_url: string | null;
  user: {
    id: string;
    name: string | null;
  };
  created_at: string;
};

export default function DirectoryPage() {
  const supabase = createClient();
  const t = useTranslations();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const [puklas, setPuklas] = useState<Pukla[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPuklas = async () => {
      try {
        setIsLoading(true);
        let query = supabase
          .from("puklas")
          .select(
            `
            id,
            title,
            bio,
            slug,
            avatar_url,
            created_at
          `,
          )
          .eq("is_public", true)
          .order("created_at", { ascending: false });

        if (debouncedSearchQuery) {
          query = query.or(
            `title.ilike.%${debouncedSearchQuery}%,bio.ilike.%${debouncedSearchQuery}%`,
          );
        }

        const { data, error } = await query;

        if (error) throw error;
        setPuklas(
          data?.map((item) => ({
            ...item,
          })) as Pukla[],
        );
      } catch (error) {
        console.error("Error fetching puklas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPuklas();
  }, [debouncedSearchQuery]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">{t("Directory.title")}</h1>
        <p className="text-muted-foreground">{t("Directory.subtitle")}</p>
      </div>

      <div className="mx-auto mb-8 max-w-xl">
        <div className="relative">
          <Search className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder={t("Directory.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : puklas.length > 0 ? (
        <>
          <p className="text-muted-foreground mb-4 text-sm">
            {t("Directory.total_puklas", { count: puklas.length })}
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {puklas.map((pukla) => (
              <Link href={`/${pukla.slug}`} target="_blank">
                <Card key={pukla.id} className="cursor-pointer transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-muted relative h-12 w-12 overflow-hidden rounded-full">
                        {pukla.avatar_url ? (
                          <Image
                            src={pukla.avatar_url}
                            alt={pukla.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="bg-primary/10 flex h-full w-full items-center justify-center">
                            <span className="text-primary text-xl font-semibold">
                              {pukla.title[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{pukla.title}</h3>

                        <p className="text-muted-foreground line-clamp-2 text-sm">
                          {pukla.bio || `puk.la/${pukla.slug}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-semibold">{t("Directory.no_puklas_found")}</h3>
          <p className="text-muted-foreground">{t("Directory.no_puklas_found_description")}</p>
        </div>
      )}
    </div>
  );
}

DirectoryPage.messages = ["Pages", "General", "Directory"];

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: pick(
        (await import(`../../locales/${locale}.json`)).default,
        DirectoryPage.messages,
      ),
    },
  };
}

import { useTranslations } from "next-intl";
import { GetStaticPropsContext } from "next";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { Search } from "lucide-react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
// UI
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
          `
          )
          .eq("is_public", true)
          .order("created_at", { ascending: false });

        console.log("puklas are ", query);
        if (debouncedSearchQuery) {
          query = query.or(
            `title.ilike.%${debouncedSearchQuery}%,bio.ilike.%${debouncedSearchQuery}%`
          );
        }

        const { data, error } = await query;

        if (error) throw error;
        setPuklas(
          data?.map((item) => ({
            ...item,
          })) as Pukla[]
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
        <h1 className="text-4xl font-bold mb-2">{t("Directory.title")}</h1>
        <p className="text-muted-foreground">{t("Directory.subtitle")}</p>
      </div>

      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute size-4 start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("Directory.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
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
          <p className="text-sm text-muted-foreground mb-4">
            {t("Directory.total_puklas", { count: puklas.length })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {puklas.map((pukla) => (
              <Link href={`/${pukla.slug}`} target="_blank">
                <Card
                  key={pukla.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                        {pukla.avatar_url ? (
                          <Image
                            src={pukla.avatar_url}
                            alt={pukla.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <span className="text-xl font-semibold text-primary">
                              {pukla.title[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{pukla.title}</h3>

                        <p className="text-sm text-muted-foreground line-clamp-2">
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
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">
            {t("Directory.no_puklas_found")}
          </h3>
          <p className="text-muted-foreground">
            {t("Directory.no_puklas_found_description")}
          </p>
        </div>
      )}
    </div>
  );
}

export async function getStaticProps({ locale }: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../locales/${locale}.json`)).default,
    },
  };
}

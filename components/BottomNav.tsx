"use client";
import { HomeIcon, Search, PlusSquare } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { SearchSheet } from "@/components/search-sheet";
import { useState } from "react";

export default function BottomNav() {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/50 backdrop-blur-sm border-t border-border/50 py-3 px-6 max-w-[390px] mx-auto">
      <div className="flex justify-around">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <HomeIcon className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary transition-colors"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-6 w-6" />
        </Button>
        <Link href="/create">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <PlusSquare className="h-6 w-6" />
          </Button>
        </Link>
      </div>
      <SearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

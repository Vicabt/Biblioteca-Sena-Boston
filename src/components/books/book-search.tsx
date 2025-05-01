'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useSearchBooks } from '@/hooks/use-books'
import type { Book } from '@/types/book'

interface BookSearchProps {
  onSelect: (book: Book) => void
}

export function BookSearch({ onSelect }: BookSearchProps) {
  const [search, setSearch] = useState('')
  const { data: books = [], isLoading } = useSearchBooks(search)

  return (
    <Command className="rounded-lg border shadow-md">
      <div className="flex items-center border-b px-3">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
        ) : (
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        )}
        <CommandInput
          placeholder="Buscar por título, autor o código..."
          value={search}
          onValueChange={setSearch}
          className="flex h-11 w-full rounded-md bg-transparent py-3 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <CommandList>
        <CommandEmpty>
          {isLoading ? 'Buscando...' : search ? 'No se encontraron resultados.' : 'Escribe para buscar libros'}
        </CommandEmpty>
        <CommandGroup>
          {books.map((book) => (
            <CommandItem
              key={book.id}
              value={`${book.title} ${book.author} ${book.internalCode}`}
              onSelect={() => onSelect(book)}
              className="cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-medium">{book.title}</span>
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <span>{book.author}</span>
                  <span>·</span>
                  <span>Código: {book.internalCode}</span>
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
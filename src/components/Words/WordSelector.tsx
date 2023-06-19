import { useState, Fragment, type Dispatch, type SetStateAction } from "react";
import { api } from "~/utils/api";
import { useDebounce } from "~/utils/useDebounce";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

export function WordSelector({
  selected,
  setSelected,
}: {
  selected: { id: string; label: string } | undefined;
  setSelected: Dispatch<
    SetStateAction<{ id: string; label: string } | undefined>
  >;
}) {
  const [searchWord, setSearchWord] = useState("");
  // const [selected, setSelected] = useState<(typeof options)[number]>();
  // debounce the setSearchWord
  const debouncedSearchWord = useDebounce(searchWord, 500);

  const { data } = api.word.getOptionWords.useQuery({
    word: debouncedSearchWord,
  });

  const options =
    data?.map((word) => ({ id: word.id, label: word.word })) || [];
  return (
    <div className="w-72 rounded-lg">
      <Combobox value={selected} onChange={setSelected}>
        <div className="relative mt-1 rounded-lg">
          <div className="relative w-full cursor-default rounded-lg bg-white text-left focus:outline-none focus-visible:ring-2  focus-visible:ring-offset-2 focus-visible:ring-offset-purple-300 sm:text-sm">
            <Combobox.Input
              placeholder="Search for a Word"
              className="w-full rounded-lg border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:border focus:shadow-[0_0_0_1.5px_rgb(168,85,247)] focus:outline-none"
              displayValue={(option: (typeof options)[number]) => {
                return option?.label || "Select a Word";
              }}
              onChange={(event) => {
                console.log(event.currentTarget.value);
                setSearchWord(event.currentTarget.value);
              }}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-800"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setSearchWord("")}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm">
              {options?.length === 0 ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  Nothing found.
                </div>
              ) : (
                options?.map((option) => (
                  <Combobox.Option
                    key={option.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-3 pr-4 ${
                        active ? "bg-purple-600 text-white" : "text-gray-900"
                      }`
                    }
                    value={option}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {option.label}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-purple-600"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
              {/* TODO: Place to request new word */}
              {/* <Combobox.Option
                value="create-sign"
                onClick={handleCreateSignClick}
                className="hover:text-purple-500"
              >
                <div className="flex w-full cursor-pointer items-center justify-between px-3">
                  Create a new Sign
                  <PlusIcon className="h-5 w-5" />
                </div>
              </Combobox.Option> */}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}

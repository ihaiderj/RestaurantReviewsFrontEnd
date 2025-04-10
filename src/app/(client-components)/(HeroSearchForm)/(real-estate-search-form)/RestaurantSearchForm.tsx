import React, { FC, useState, FormEvent, useRef, useEffect, useCallback } from "react";
import RRSearchBox from "../RRSearchBox";
import { SearchTab } from "../RRSearchForm";
import { useRouter } from "next/navigation";
import ButtonSubmit from "../ButtonSubmit";
import RestaurantType from "./RestaurantType";
import DistanceRange from "./DistanceRange";
import PropertyTypeSelect from "./PropertyTypeSelect";
export interface RestaurantSearchFormProps {
  activeTab?: SearchTab;
  defaultSearchText?: string;
  defaultSearchDistance?: string;
  defaultSelectedItems?: string[];
}

const RestaurantSearchForm: FC<RestaurantSearchFormProps> = ({ 
  activeTab = "Near Me",
  defaultSearchText = "",
  defaultSearchDistance = "0-10",
  defaultSelectedItems = []
}) => {
  const [searchText, setSearchText] = useState(defaultSearchText);
  const [searchDistance, setSearchDistance] = useState(defaultSearchDistance);
  const [selectedItems, setSelectedItems] = useState<string[]>(defaultSelectedItems);
  const router = useRouter();
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  console.log("RestaurantSearchForm", defaultSearchText, defaultSearchDistance, defaultSelectedItems);
  
  const showRestaurantType = activeTab === "International Cuisine" || 
                            activeTab === "Fast Food" || 
                            activeTab === "Favourite Foods";

  // Direct handler for search text coming from SearchBox
  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (activeTab) {
      queryParams.append("category", activeTab);
    }
    
    if (searchText) {
      queryParams.append("query", searchText);
    }
    
    if (searchDistance) {
      queryParams.append("distance", searchDistance);
    }
    
    // Add selected items from RestaurantType if any
    if (selectedItems.length > 0) {
      queryParams.append("filters", selectedItems.join(','));
    }
    
    // Log what we're actually submitting for debugging
    console.log("Submitting with params:", {
      category: activeTab,
      query: searchText,
      distance: searchDistance,
      filters: selectedItems.join(',')
    });
    
    // Navigate to search results page
    const queryString = queryParams.toString();
    const url = `/listing-stay-map${queryString ? `?${queryString}` : ''}`;
    router.push(url as any);
  };

  // Handle distance change
  const handleDistanceChange = (value: string) => {
    setSearchDistance(value);
  };

  // Handle selection change from RestaurantType - now with useCallback
  const handleSelectionChange = useCallback((items: string[]) => {
    setSelectedItems(items);
  }, []); // Empty dependency array means this function will maintain the same reference

  // When active tab changes, log the state once
  // Using a ref to prevent this effect from running on every render
  const previousTabRef = useRef(activeTab);
  
  useEffect(() => {
    // Only log when the tab actually changes, not on every render
    if (previousTabRef.current !== activeTab) {
      // Update params when tab changes
      console.log("Form state after tab change:", {
        category: activeTab,
        query: searchText,
        distance: searchDistance,
        filters: selectedItems.join(',')
      });
      
      // Update the ref to current tab
      previousTabRef.current = activeTab;
    }
  }, [activeTab, searchText, searchDistance, selectedItems]);

  return (
    <form 
      ref={formRef}
      className="w-full relative xl:mt-8 flex flex-col lg:flex-row lg:items-center rounded-3xl lg:rounded-full shadow-xl dark:shadow-2xl bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700 lg:divide-y-0"
      onSubmit={handleSubmit}
    >
      <div ref={searchBoxRef} className="flex-[1.5]">
        <RRSearchBox 
          className="w-full" 
          onChange={handleSearchTextChange}
          initialValue={defaultSearchText}
        />
      </div>

      <div className="self-center border-r border-slate-200 dark:border-slate-700 h-8"></div>
      {showRestaurantType ? (
        <RestaurantType 
          activeTab={activeTab} 
          className="flex-1" 
          onSelectionChange={handleSelectionChange}
          initialValue={defaultSelectedItems}
        />
      ) : null}
      
      <div className="self-center border-r border-slate-200 dark:border-slate-700 h-8">
            
      </div>
      <PropertyTypeSelect />
      <div className="flex-[1.3] flex items-center">
        <div className="flex-grow">
          <DistanceRange 
            activeTab={activeTab}
            onDistanceChange={handleDistanceChange} 
            defaultSearchDistance={defaultSearchDistance}
          />
        </div>
        
        <div className="pr-2 xl:pr-4">
          <ButtonSubmit 
            type="submit"
            searchParams={{
              category: activeTab,
              query: searchText,
              distance: searchDistance,
              filters: selectedItems.length > 0 ? selectedItems.join(',') : ''
            }} 
          />
        </div>
      </div>
    </form>
  );
};

export default RestaurantSearchForm;

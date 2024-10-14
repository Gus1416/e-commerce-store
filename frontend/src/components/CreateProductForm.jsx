import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import FormInput from './FormInput';
import { Loader, PlusCircle, Upload } from 'lucide-react';
import { useProductStore } from '../stores/useProductStore';

const categories = ["jeans", "t-shirts", "shoes", "glasses", "jackets", "suits", "bags"];

const CreateProductForm = () => {

  const { createProduct, loading} = useProductStore();

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      createProduct(newProduct);
      await setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        image: ""
      })
    } catch (error) {
      console.log("Error creating product", error.message);
    }
  };

  /**
   * This function is called when the user selects an image to upload.
   * The function takes the selected file and uses the FileReader API to
   * read the file as a data URL. The data URL is then used to update the
   * image property of the newProduct state object.
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      const reader = new FileReader(); // Create a new FileReader instance

      // When the file is loaded, update the image property of the newProduct state object
      reader.onload = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };

      reader.readAsDataURL(file); // Read the file as a data URL in base64 format
    }
  };

  return (
    <motion.div 
      className='bg-gray-800 shadow-lg rounded-lg p-8 mb-8 max-w-xl mx-auto'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className='text-2xl font-semibold mb-6 text-emerald-300'>Create New Product</h2>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <FormInput
          label="Product name"
          FormElement="input"
          type="text"
          id="name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />

        <FormInput
          label="Description"
          FormElement="textarea"
          id="description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        />

        <FormInput
          label="Price"
          FormElement="input"
          type="number"
          id="price"
          step="0.01"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        />

        <FormInput
          label="Category"
          FormElement="select"
          id="category"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          options={categories}
        />

        <div className='mt-1 flex items-center'>
          <input
            type="file"
            id="image"
            onChange={handleImageChange}
            accept='image/*'
            className='sr-only'
          />
          <label
            htmlFor="image"
            className='cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium
            text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
          >
            <Upload className='inline-block h-5 w-5 mr-2' />
            Upload Image
          </label>
          {newProduct.image && (
            <span className='ml-3 text-sm text-gray-400'>Image uploaded</span>
          )}
        </div>

        <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition
              duration-150 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Loading...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                  Create Product
                </>
              )}
            </button>
      </form>
    </motion.div>
  )
}

export default CreateProductForm
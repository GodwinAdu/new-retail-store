# Retail POS

A modern Point of Sale (POS) system tailored for retail businesses, featuring advanced inventory management, a comprehensive dashboard, and immersive 3D visualizations.

## Features

- **Retail Dashboard**: Centralized hub for managing sales, inventory, and staff performance.
- **Inventory Management**: Track stock levels, manage products, and organize categories efficiently.
- **3D Visualization**: Interactive 3D elements for enhanced product or store visualization using Three.js.
- **Authentication**: Secure role-based access for administrators and staff.
- **Payment Processing**: Integrated with Paystack for reliable and secure transactions.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Directory)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **3D Graphics**: [Three.js](https://threejs.org/) with [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) and [@react-three/drei](https://github.com/pmndrs/drei)
- **Database**: [MongoDB](https://www.mongodb.com/) using [Mongoose](https://mongoosejs.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 20 or later recommended)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd retail-pos
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Environment Variables:**

    Create a `.env` file in the root directory and add the following variables:

    ```env
    MONGODB_URL=mongodb://localhost:27017/RetailPro # Or your MongoDB Atlas URL
    PAYSTACK_SECRET_KEY=your_paystack_secret_key
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/`: Contains the application source code (Pages, Layouts, API routes).
    - `(auth)`: Authentication related pages.
    - `dashboard`: Admin dashboard for retail management.
    - `pricing`: Pricing and subscription pages.
    - `setup`: Initial setup configuration.
- `components/`: Reusable UI components.
- `lib/`: Utility functions, database models, and hooks.
    - `models`: Mongoose schemas.
    - `actions`: Server actions for data mutation.
    - `contexts`: React context providers.
- `public/`: Static assets.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

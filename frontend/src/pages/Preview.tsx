import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ErrorMessage from "../components/ui/ErrorMessage";
import Input from "../components/ui/Input";
import Loading from "../components/ui/Loading";

export default function Preview() {
	return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center flex flex-col gap-5">
        <h1 className="font-heading text-5xl font-medium text-primary">
          Yum Yard
        </h1>

        <p className="my-4 text-lg text-text-secondary">
          Your recipe community
        </p>

        <Button variant="primary">
          Get Started
        </Button>

        <Card>
          <h2 className="font-heading text-xl">Recipe</h2>
          <p className="mt-2 text-text-secondary">
            A delicious recipe.
          </p>
        </Card>

        <Input
          type="text"
          placeholder="Search recipes..."
        />

        <Badge>Vegetarian</Badge>

        <Badge variant="primary">
          Easy
        </Badge>

        <Badge variant="success">
          Published
        </Badge>

        <Loading />

        <Loading label="Loading recipes..." />

        <ErrorMessage />

        <ErrorMessage message="Unable to load recipes." />
      </div>
    </main>
  );
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function NewPollPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new poll</CardTitle>
        <CardDescription>Describe your question and add a few options.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="question">Question</Label>
            <Input id="question" placeholder="What should we build next?" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="option1">Option 1</Label>
            <Input id="option1" placeholder="First option" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="option2">Option 2</Label>
            <Input id="option2" placeholder="Second option" />
          </div>
          <Button type="submit" className="w-full">Create poll</Button>
        </form>
      </CardContent>
    </Card>
  );
}






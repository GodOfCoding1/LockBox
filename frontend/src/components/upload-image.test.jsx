import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import AddDialog from "./add-card";
import SingleFileUploader from "./upload-image";

const chooseFile = (file) => {
  fireEvent.change(document.querySelector("#file"), {
    target: { files: [file] },
  });
};

jest.mock("../utils/axios", () => ({
  api: { post: jest.fn() },
}));

beforeEach(() => {
  global.URL.createObjectURL = jest.fn(() => "blob:preview");
  global.URL.revokeObjectURL = jest.fn();
});

test("add dialog shows the file picker and text box without a type selector", () => {
  render(<AddDialog open onOpen={() => {}} onClose={() => {}} />);

  expect(screen.queryByLabelText("Data type")).not.toBeInTheDocument();
  expect(screen.getByText("Choose file")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Paste image" })).toBeInTheDocument();
  expect(screen.getByLabelText("Text")).toBeInTheDocument();

  const input = document.querySelector("#file");
  expect(input).toHaveAttribute("accept", expect.stringContaining("image/*"));
  expect(input).toHaveAttribute("accept", expect.stringContaining("audio/*"));
  expect(input).toHaveAttribute("accept", expect.stringContaining("video/*"));
});

test("image files show a preview and keep encrypt available", async () => {
  render(<SingleFileUploader />);
  const file = new File(["img"], "shot.png", { type: "image/png" });

  chooseFile(file);

  expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  expect(screen.getByAltText("Selected upload preview")).toHaveAttribute(
    "src",
    "blob:preview"
  );
  expect(screen.getByText(/shot\.png/)).toBeInTheDocument();
  expect(screen.getByLabelText(/Encrypt file/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Upload file" })).toBeInTheDocument();
});

test("an image extension is previewed when the browser omits a mime type", async () => {
  render(<SingleFileUploader />);
  const file = new File(["img"], "shot.jpg", { type: "" });

  chooseFile(file);

  expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  expect(screen.getByAltText("Selected upload preview")).toBeInTheDocument();
  expect(screen.getByText(/shot\.jpg · image/)).toBeInTheDocument();
});

test("audio and unknown files upload without an image preview", async () => {
  const { rerender } = render(<SingleFileUploader />);
  const audio = new File(["aud"], "song.mp3", { type: "audio/mpeg" });

  chooseFile(audio);

  expect(screen.queryByAltText("Selected upload preview")).not.toBeInTheDocument();
  expect(screen.getByText(/song\.mp3/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Upload file" })).toBeInTheDocument();

  rerender(<SingleFileUploader />);
  const pdf = new File(["pdf"], "notes.pdf", { type: "application/pdf" });
  chooseFile(pdf);

  expect(screen.queryByAltText("Selected upload preview")).not.toBeInTheDocument();
  expect(screen.getByText(/notes\.pdf/)).toBeInTheDocument();
  expect(screen.getByLabelText(/Encrypt file/)).toBeInTheDocument();
});

import { expect } from "chai";
import { findNotCommonStart } from "../../completion/provideInlineCompletionItems";
import { describe, it } from "mocha";

describe("findNotCommonStart", () => {
  it("should return empty string if suggestion is equal to currLine", () => {
    const currLine = "hello";
    const suggestion = "hello";
    expect(findNotCommonStart(currLine, suggestion)).to.equal("");
  });

  it("should return entire currLine if suggestion does not contain any common characters", () => {
    const currLine = "hello";
    const suggestion = "world";
    expect(findNotCommonStart(currLine, suggestion)).to.equal("hello");
  });

  it("should return first character of currLine if suggestion starts with second character of currLine", () => {
    const currLine = "hello";
    const suggestion = "ello";
    expect(findNotCommonStart(currLine, suggestion)).to.equal("h");
  });

  it("should return first two characters of currLine if suggestion starts with third character of currLine", () => {
    const currLine = "hello";
    const suggestion = "llo";
    expect(findNotCommonStart(currLine, suggestion)).to.equal("he");
  });

  it("should return currLine if suggestion and currLine have nothing in common", () => {
    const currLine = "hello";
    const suggestion = "world";
    expect(findNotCommonStart(currLine, suggestion)).to.equal("hello");
  });
});

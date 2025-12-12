import React from "react";
import { MarkdownEditor } from "aksha-md-editor";
import "aksha-md-editor/styles.css";

/**
 * IMPORTANT:
 * Docusaurus requires the object to be named "ReactLiveScope"
 * AND includes "...React" or React hooks won't work inside live editor.
 */
const ReactLiveScope = {
  React,
  ...React,       // makes useState, useEffect, etc. available
  MarkdownEditor, // makes <MarkdownEditor /> available in live blocks
};

export default ReactLiveScope;

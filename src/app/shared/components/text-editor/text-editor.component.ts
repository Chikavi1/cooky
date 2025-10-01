import { Component } from '@angular/core';
// import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-text-editor',
  standalone: true,
  // imports: [QuillModule],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss'
})
export class TextEditorComponent {

    editorConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }]
    ]
  };

}

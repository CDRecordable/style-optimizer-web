import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Heading1, Heading2, List, ListOrdered, 
  Quote, Undo, Redo, Pilcrow 
} from 'lucide-react';

// Botón de la barra de herramientas
const MenuButton = ({ onClick, isActive, disabled, children, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded hover:bg-gray-100 transition-colors ${
      isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

const RichTextEditor = ({ content, onChange, placeholder = "Escribe aquí...", className = "" }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        // Clase base para el contenido: no gestiona el scroll, solo el estilo de texto
        class: 'prose prose-indigo max-w-none focus:outline-none min-h-[300px] p-6 text-gray-700 text-lg leading-relaxed font-serif',
      },
    },
    onUpdate: ({ editor }) => {
      // Capturamos el HTML completo. Si el scroll funciona, esto captura todo.
      onChange(editor.getHTML());
    },
  });

  // Sincronizar contenido si cambia desde fuera (ej: al cargar un nuevo capítulo)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    // Contenedor principal: Flex vertical y capaz de crecer
    <div className={`flex flex-col flex-grow border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 transition-all ${className}`}>
      
      {/* BARRA DE HERRAMIENTAS (ALTURA FIJA) */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100 flex-wrap flex-shrink-0">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Negrita"
        >
          <Bold size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Cursiva"
        >
          <Italic size={18} />
        </MenuButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1 flex-shrink-0"></div>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Título 1"
        >
          <Heading1 size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Título 2"
        >
          <Heading2 size={18} />
        </MenuButton>

        <div className="w-px h-6 bg-gray-300 mx-1 flex-shrink-0"></div>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Lista"
        >
          <List size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Cita"
        >
          <Quote size={18} />
        </MenuButton>

        <div className="flex-grow"></div>

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Deshacer"
        >
          <Undo size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rehacer"
        >
          <Redo size={18} />
        </MenuButton>
      </div>

      {/* ÁREA DE TEXTO: Este contenedor toma todo el espacio restante y habilita el scroll */}
      {/* CORRECCIÓN: El EditorContent debe estar envuelto en un contenedor flex-grow overflow-y-auto */}
      <div className="flex-grow overflow-y-auto"> 
        <EditorContent editor={editor} className="cursor-text" />
      </div>
    </div>
  );
};

export default RichTextEditor;
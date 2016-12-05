Module TypeScriptConsole

    Sub Main()

    End Sub

    Public ReadOnly Property ProjectAddress As String
        Get
            Dim address = AppDomain.CurrentDomain.BaseDirectory()
            Dim extended = "bin\Debug\"
            Return address.Substring(0, address.Length - extended.Length)
        End Get
    End Property
    Public ReadOnly Property TSFiles As List(Of String)
        Get
            Dim address = ProjectAddress
            Dim AssemblyName = Reflection.Assembly.GetExecutingAssembly().FullName
            AssemblyName = AssemblyName.Substring(0, AssemblyName.IndexOf(","))
            Dim proj = address + AssemblyName + ".vbproj"
            Dim doc As Xml.XmlDocument = New Xml.XmlDocument()
            doc.Load(proj)
            Dim Files As New List(Of String)
            For Each node In doc.Find("TypeScriptCompile[Include]")
                Files.Add(address + node.GetAttribute("Include"))
            Next
            Return Files
        End Get
    End Property
End Module

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["SmartMed.Api/SmartMed.Api.csproj", "SmartMed.Api/"]
RUN dotnet restore "SmartMed.Api/SmartMed.Api.csproj"
COPY . .
WORKDIR "/src/SmartMed.Api"
RUN dotnet publish "SmartMed.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "SmartMed.Api.dll"]